export const STUDENT_ROLE_TYPES = ["STRIKER", "SPECIAL"] as const
export const STUDENT_WEAPON_TYPES = ["AR", "FT", "GL", "HG", "MG", "MT", "RG", "RL", "SG", "SMG", "SR"] as const
export const STUDENT_POSITION_TYPES = ["FRONT", "MIDDLE", "BACK"] as const
export const STUDENT_CLASS_TYPES = ["タンク", "アタッカー", "ヒーラー", "サポーター", "T.S"] as const
export const STUDENT_SCHOOL_TYPES = ["アビドス", "アリウス", "ゲヘナ", "百鬼夜行", "ミレニアム", "レッドウィンター", "山海経", "SRT特殊学園", "トリニティ", "ヴァルキューレ", "その他"] as const
export const STUDENT_ATK_TYPES = ["爆発", "貫通", "神秘", "振動"] as const
export const STUDENT_DEF_TYPES = ["重装", "軽装", "特殊", "弾力"] as const
export const STUDENT_LANDSCAPE_APT_ORDER = ["S", "A", "B", "C", "D"] as const
export const STUDENT_EQUIP1_TYPES = ["帽子", "グローブ", "シューズ"] as const
export const STUDENT_EQUIP2_TYPES = ["ヘアピン", "バッジ", "バッグ"] as const
export const STUDENT_EQUIP3_TYPES = ["腕時計", "お守り", "ネックレス"] as const
export const COMMON_ITEM_CATEGORY_TYPES = ["技術ノート", "戦術教育BD", "スキル強化素材", "神名文字"] as const
export const EQUIPMENT_STAT_TYPES = ["attack", "attackPercent", "criticalDamageFactor", "criticalPoint", "accuracy", "hitpointPercent", "hitpoint", "defence", "healEffectivenessRate", "evasion", "CCResistRatePercent", "criticalChanceResistPoint", "criticalDamageResistRate", "healPercent", "CCPowerPercent"] as const

export type PageTitle = {
    path: string
    title: string
}

export type RawCommitLog = {
    commit: {
        author: {
            name: string
            date: string
        }
        message: string
    }
    html_url: string
}

export type CommitLog = {
    author: string
    date: string
    message: string
    url: string
}

export type StudentParams = {
    minHitpoint: number
    hitpointIncrease: number
    minAtk: number
    atkIncrease: number
    minDef: number
    defIncrease: number
    minHeal: number
    healIncrease: number
    accuracy: number
    evasion: number
    criticalPoint: number
    criticalDamageFactor: string
    stability: number
}

export type StudentSkillUpgradeRequirement = {
    itemName: string
    quantity: number
}

export type StudentSkillInfo = {
    skillName: string
    skillDesc: string
    parameters: string[][]
    relatedSkills: StudentSkillInfo[] | null
}

export type StudentExSkillInfo = StudentSkillInfo & {
    costs: number[]
}

export type StudentSkills = {
    exSkill: StudentExSkillInfo
    normalSkill: StudentSkillInfo
    normalSkillPlus: StudentSkillInfo | null
    passiveSkill: StudentSkillInfo
    passiveSkillPlus: StudentSkillInfo
    subSkill: StudentSkillInfo
}

export type StudentRole = (typeof STUDENT_ROLE_TYPES)[number]
export type StudentWeapon = (typeof STUDENT_WEAPON_TYPES)[number]
export type StudentPosition = (typeof STUDENT_POSITION_TYPES)[number]
export type StudentClass = (typeof STUDENT_CLASS_TYPES)[number]
export type StudentSchool = (typeof STUDENT_SCHOOL_TYPES)[number]
export type StudentAttackAttr = (typeof STUDENT_ATK_TYPES)[number]
export type StudentDefenceAttr = (typeof STUDENT_DEF_TYPES)[number]
export type StudentLandscapeApt = (typeof STUDENT_LANDSCAPE_APT_ORDER)[number]
export type StudentEquip1 = (typeof STUDENT_EQUIP1_TYPES)[number]
export type StudentEquip2 = (typeof STUDENT_EQUIP2_TYPES)[number]
export type StudentEquip3 = (typeof STUDENT_EQUIP3_TYPES)[number]

export type StudentBirthday = {
    month: number
    day: number
}

export type StudentInfo = {
    name: string
    fullName: string
    ruby: string
    starGrade: "★1" | "★2" | "★3"
    role: StudentRole
    weapon: StudentWeapon
    position: StudentPosition
    class: StudentClass
    school: StudentSchool
    atkAttr: StudentAttackAttr
    defAttr: StudentDefenceAttr
    townApt: StudentLandscapeApt
    outdoorApt: StudentLandscapeApt
    indoorApt: StudentLandscapeApt
    equip1: StudentEquip1
    equip2: StudentEquip2
    equip3: StudentEquip3
    birthday: StudentBirthday | null
    params: StudentParams
    skills: StudentSkills
    exSkillUpgradeRequirements: StudentSkillUpgradeRequirement[][]
    commonSkillUpgradeRequirements: StudentSkillUpgradeRequirement[][]
}

export type BirthdaySchedule = {
    student: string
    date: StudentBirthday
}

type StageInfoBase = {
    stageID: string
    difficulty: "NORMAL" | "HARD"
    name: string
    terrain: "town" | "outdoor" | "indoor"
    recommendedLevel: number
    challengeRequiredTurns: number
}

export type RawStageInfo = StageInfoBase & {
    dropItems: string[]
}

export type StageInfo = StageInfoBase & {
    dropItems: ItemInfo[]
}

export type AreaInfo = {
    areaID: number
    stages: RawStageInfo[]
}

export type ItemDropLocationInfo = {
    stages: string[]
    recommended: string
}

type ItemInfoBase = {
    name: string
    rarity: 0 | 1 | 2 | 3
    dropIn: ItemDropLocationInfo | null
}

export type CommonItemInfo = ItemInfoBase & {
    description: string
    category: (typeof COMMON_ITEM_CATEGORY_TYPES)[number]
}

export type EquipmentParams = {
    paramType: (typeof EQUIPMENT_STAT_TYPES)[number]
    paramValue: string | number
}

export type EquipmentInfo = ItemInfoBase & {
    description: string
    category: "装備品"
    equipmentCategory: StudentEquip1 | StudentEquip2 | StudentEquip3
    tier: number
    params: EquipmentParams[]
}

export type EquipmentBlueprintInfo = ItemInfoBase & {
    category: "装備の設計図"
    parentEquipment: string
}

export type ItemInfo = CommonItemInfo | EquipmentInfo | EquipmentBlueprintInfo
