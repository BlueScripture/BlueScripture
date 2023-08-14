import { redirect } from "@sveltejs/kit"
import PageTitleList from "$lib/datas/pageTitleList.json"
import type { PageTitle } from "$lib/types"

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
    }
} as const
