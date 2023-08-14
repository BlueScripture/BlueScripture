import { error } from "@sveltejs/kit"
import Areas from "$lib/datas/stageList.json"
import type { RawStageInfo, AreaInfo, ItemInfo, StageInfo } from "$lib/types"
import Items from "$lib/datas/itemList.json"

const items = structuredClone(Items)

type Params = {
    stageID: string
}

function findStage(areaID: number, stageID: string): StageInfo {
    const area = Areas.find((area) => area.areaID == areaID) as AreaInfo
    const rawStageInfo = area.stages.find((stage) => stage.stageID == stageID) as RawStageInfo

    const dropItems = rawStageInfo.dropItems.map((itemName) => items.find((itemInfo) => itemInfo.name == itemName)) as ItemInfo[]

    return {
        stageID: rawStageInfo.stageID,
        difficulty: rawStageInfo.difficulty,
        name: rawStageInfo.name,
        terrain: rawStageInfo.terrain,
        recommendedLevel: rawStageInfo.recommendedLevel,
        challengeRequiredTurns: rawStageInfo.challengeRequiredTurns,
        dropItems: dropItems
    }
}

const stageIDRegex = /^\d+-\d+[N|H]$/

/** @type {import('./$types').PageServerLoad} */
export function load({ params }) {
    if (!stageIDRegex.test((params as Params).stageID)) {
        throw error(404, "Not found")
    }

    const stageID = (params as Params).stageID
    const areaID = parseInt((stageID.match(/\d+(?=-)/g) as RegExpMatchArray)[0])

    const stageInfo = findStage(areaID, stageID)

    return {
        stageInfo: stageInfo
    }
}
