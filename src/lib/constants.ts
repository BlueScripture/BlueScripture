export const CURRENT_LEVEL_CAP = 90 as const
export const LATEST_EQUIPMENT_TIER = 9 as const
export const TERRAIN_ALIAS_DICT = {
    town: "市街地",
    outdoor: "屋外",
    indoor: "屋内"
} as const
export const EQUIPMENT_PARAMS_DICT = {
    attack: "攻撃力",
    attackPercent: "攻撃力",
    criticalDamageFactor: "会心ダメージ率",
    criticalPoint: "会心値",
    accuracy: "命中値",
    hitpoint: "最大HP",
    hitpointPercent: "最大HP",
    defence: "防御力",
    healPercent: "治癒力",
    healEffectivenessRate: "回復受容効率の強化",
    evasion: "回避値",
    criticalChanceResistPoint: "会心発生抵抗力",
    criticalDamageResistRate: "会心ダメージ抵抗率",
    CCResistRatePercent: "CC抵抗力",
    CCPowerPercent: "CC強化力"
} as const
