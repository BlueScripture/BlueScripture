import { redirect } from "@sveltejs/kit"
import PageTitleList from "$lib/datas/pageTitleList.json"
import type { ItemInfo, PageTitle, RawStageInfo, SearchResult, StudentInfo, StudentRole } from "$lib/types"
import Fuse from "fuse.js"
import Students from "$lib/datas/studentList.json"
import Stages from "$lib/datas/stageList.json"
import Items from "$lib/datas/itemList.json"

const students = structuredClone(Students) as StudentInfo[]
const stages = structuredClone(Stages).flatMap((area) => area.stages) as RawStageInfo[]
const items = structuredClone(Items) as ItemInfo[]

const studentsSearchOptions = {
    threshold: 0.3,
    shouldSort: true,
    useExtendedSearch: true,
    keys: [{ name: "name", weight: 0.6 }, { name: "fullName", weight: 0.3 }, { name: "ruby", weight: 0.8 }, "role"]
}
const stagesSearchOptions = {
    threshold: 0.3,
    shouldSort: true,
    useExtendedSearch: true,
    keys: ["stageID", "name"]
}
const itemsSearchOptions = {
    threshold: 0.3,
    shouldSort: true,
    useExtendedSearch: true,
    keys: ["name"]
}
const studentsSearchIndex = new Fuse(students, studentsSearchOptions)
const stagesSearchIndex = new Fuse(stages, stagesSearchOptions)
const itemsSearchIndex = new Fuse(items, itemsSearchOptions)

function ignoreEvent(event: Event) {
    event.preventDefault()
}

export function getCurrentLocation(currentPath: string): PageTitle[] {
    const tmpArr: PageTitle[] = [
        {
            path: "",
            title: "ホーム"
        }
    ]

    let currentTargetPath = ""
    for (const encodedPathname of currentPath.split("/")) {
        if (encodedPathname == "") {
            continue
        }
        const pathname = decodeURI(encodedPathname)

        currentTargetPath += pathname

        const pageTitle = (PageTitleList as PageTitle[]).find((pageTitle) => pageTitle.path == currentTargetPath)

        if (pageTitle != null) {
            tmpArr.push({
                path: currentTargetPath,
                title: pageTitle.title
            })
        } else if (pathname != "") {
            tmpArr.push({
                path: currentTargetPath,
                title: pathname
            })
        }

        currentTargetPath += "/"
    }

    return tmpArr
}

export function validatePath(encodedPathname: string) {
    const pathname = decodeURI(encodedPathname)

    if (/<.+>/.test(pathname)) {
        throw redirect(307, "/")
    }
}

export function toggleListControlMenu(listControlMenu: HTMLElement, opened: boolean) {
    if (!listControlMenu) {
        return
    }

    if (opened) {
        listControlMenu.style.transitionDuration = "0s"
        listControlMenu.style.height = "auto"
        const menuHeight = listControlMenu.clientHeight
        listControlMenu.style.height = "0px"
        requestAnimationFrame(() => {
            listControlMenu.style.transitionDuration = "inherit"
            listControlMenu.style.height = `${menuHeight}px`
            listControlMenu.style.marginBottom = "3rem"
        }) // HACK: Wait few ms
    } else {
        listControlMenu.style.height = "0px"
        listControlMenu.style.marginBottom = "0px"
    }
}

export const Search = {
    SEARCH_RESULT_LIMIT: 5,

    search(query: string): SearchResult {
        const students = this.student(query)
        const stages = this.stage(query)
        const items = this.item(query)

        const searchResult: SearchResult = {
            students,
            stages,
            items
        }

        return searchResult
    },

    student(query: string): StudentInfo[] {
        const katakanaName = Utils.convertHiraganaToKatakana(query)

        const searchQuery: Fuse.Expression = {
            $or: [{ name: katakanaName }, { fullName: query }, { ruby: query }]
        }

        const searchResults = studentsSearchIndex.search(searchQuery, { limit: this.SEARCH_RESULT_LIMIT })

        return searchResults.map((result) => result.item)
    },

    studentWithRole(query: string, role: StudentRole, ignoreGroup: (string | null)[]): StudentInfo[] {
        const nameQuery = (() => {
            const katakanaName = Utils.convertHiraganaToKatakana(query)

            if (ignoreGroup.length > 0) {
                const ignoreGroupQuery = ignoreGroup.map((element) => `!${element}$`).join(" ")
                if (!ignoreGroup.some((element) => element == query)) {
                    return `${ignoreGroupQuery} ${katakanaName}`
                } else {
                    return ignoreGroupQuery
                }
            } else {
                return katakanaName
            }
        })()

        const searchQuery: Fuse.Expression = {
            $and: [
                {
                    $or: [{ name: nameQuery }, { fullName: query }, { ruby: query }]
                },
                { role: role }
            ]
        }

        const searchResults = studentsSearchIndex.search(searchQuery, { limit: this.SEARCH_RESULT_LIMIT })

        return searchResults.map((result) => result.item)
    },

    stage(query: string): RawStageInfo[] {
        const searchResults = stagesSearchIndex.search(query, { limit: this.SEARCH_RESULT_LIMIT })

        return searchResults.map((result) => result.item)
    },

    item(query: string): ItemInfo[] {
        const searchResults = itemsSearchIndex.search(query, { limit: this.SEARCH_RESULT_LIMIT })

        return searchResults.map((result) => result.item)
    }
}

export const Scroll = {
    lock() {
        document.addEventListener("touchmove", ignoreEvent, { passive: false })
        document.addEventListener("wheel", ignoreEvent, { passive: false })
    },

    unlock() {
        document.removeEventListener("touchmove", ignoreEvent)
        document.removeEventListener("wheel", ignoreEvent)
    }
}

export const Utils = {
    roundFloatToDigit(num: number, digit: number): number {
        const pow = Math.pow(10, digit)
        return Math.round(num * pow) / pow
    },

    calcurateIncreaseRate(min: number, max: number, refLv: number): number {
        return this.roundFloatToDigit((max - min) / (refLv - 1), 2)
    },

    calcurateIncreasedParam(min: number, increase: number, refLv: number): number {
        return Math.round(min + increase * (refLv - 1))
    },

    limitVariableRange(target: number, min: number, max: number) {
        return Math.max(min, Math.min(target, max))
    },

    /** 1から`length`までの数値を含む連番の配列を生成する
     * @example generateNumberSequence(5) -> [1, 2, 3, 4, 5]
     */
    generateNumberSequence(length: number): number[] {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        return [...Array(length)].map((_, i) => i + 1)
    },

    convertHiraganaToKatakana(str: string): string {
        return str.replace(/[\u3041-\u3096]/g, (match) => {
            const chr = match.charCodeAt(0) + 0x60
            return String.fromCharCode(chr)
        })
    }
} as const
