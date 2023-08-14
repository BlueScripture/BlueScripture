<script lang="ts">
    import type { EquipmentInfo, ItemInfo, StudentExSkillInfo, StudentInfo, StudentSkillInfo } from "$lib/types"
    import { Utils } from "$lib/utils.js"
    import Items from "$lib/datas/itemList.json"
    import { CURRENT_LEVEL_CAP, EQUIPMENT_PARAMS_DICT, LATEST_EQUIPMENT_TIER } from "$lib/constants"

    export let data: {
        studentInfo: StudentInfo
    }

    type DisplayedSkills = {
        type: keyof typeof SKILL_TYPE_LABEL_DICT
        info: StudentSkillInfo
    }[]

    const items = structuredClone(Items) as ItemInfo[]
    const equipments = items.filter((item) => item.category == "装備品") as EquipmentInfo[]

    let referenceLevel = 1
    let equipmentTier = 1
    let exSkillLevel = 1
    let commonSkillLevel = 1
    let isPlusSkillSelected = false

    const PROFILE_LABEL_NAMES = [
        {
            id: "fullName",
            name: "名前"
        },
        {
            id: "role",
            name: "役割"
        },
        {
            id: "starGrade",
            name: "レア度"
        },
        {
            id: "weapon",
            name: "武器種"
        },
        {
            id: "position",
            name: "ポジション"
        },
        {
            id: "class",
            name: "クラス"
        },
        {
            id: "school",
            name: "学校"
        },
        {
            id: "birthday",
            name: "誕生日"
        },
        {
            id: "atkAttr",
            name: "攻撃属性"
        },
        {
            id: "defAttr",
            name: "防御属性"
        },
        {
            id: "townApt",
            name: "市街地適性"
        },
        {
            id: "outdoorApt",
            name: "屋外適性"
        },
        {
            id: "indoorApt",
            name: "屋内適性"
        },
        {
            id: "equip1",
            name: "装備品1"
        },
        {
            id: "equip2",
            name: "装備品2"
        },
        {
            id: "equip3",
            name: "装備品3"
        }
    ] as const

    const PARAMS_LABEL_NAMES = [
        {
            id: "accuracy",
            name: "命中値"
        },
        {
            id: "evasion",
            name: "回避値"
        },
        {
            id: "criticalPoint",
            name: "会心値"
        },
        {
            id: "criticalDamageFactor",
            name: "会心ダメージ"
        },
        {
            id: "stability",
            name: "安定値"
        }
    ] as const

    const SKILL_TYPE_LABEL_DICT = {
        normal: "ノーマルスキル",
        normalPlus: "ノーマルスキル+",
        passive: "パッシブスキル",
        passivePlus: "パッシブスキル+",
        sub: "サブスキル"
    } as const

    const SKILL_EFFECT_VALUE_REGEX = RegExp(/\d+(\.\d+)?(([%秒回個つ]|発分)?)?(?![人体])/g)

    let basicParams = calculateBasicParams()
    let displayedEquipments = setDisplayedEquipments(data.studentInfo, equipmentTier)
    let displayedSkills = setDisplayedSkills()

    function calculateBasicParams() {
        return [
            {
                key: "最大HP",
                value: Utils.calcurateIncreasedParam(data.studentInfo.params.minHitpoint, data.studentInfo.params.hitpointIncrease, referenceLevel)
            },
            {
                key: "攻撃力",
                value: Utils.calcurateIncreasedParam(data.studentInfo.params.minAtk, data.studentInfo.params.atkIncrease, referenceLevel)
            },
            {
                key: "防御力",
                value: Utils.calcurateIncreasedParam(data.studentInfo.params.minDef, data.studentInfo.params.defIncrease, referenceLevel)
            },
            {
                key: "治癒力",
                value: Utils.calcurateIncreasedParam(data.studentInfo.params.minHeal, data.studentInfo.params.healIncrease, referenceLevel)
            }
        ]
    }

    function setDisplayedEquipments(studentInfo: StudentInfo, tier: number): EquipmentInfo[] {
        return [studentInfo.equip1, studentInfo.equip2, studentInfo.equip3].map((studentEquip) => equipments.find((equipment) => equipment.equipmentCategory == studentEquip && equipment.tier == tier) as EquipmentInfo)
    }

    function setDisplayedSkills(): DisplayedSkills {
        const skills: DisplayedSkills = (() => {
            const tmpArr: DisplayedSkills = []
            if (isPlusSkillSelected) {
                tmpArr.push(
                    /* eslint-disable indent */
                    data.studentInfo.skills.normalSkillPlus
                        ? {
                              type: "normalPlus",
                              info: data.studentInfo.skills.normalSkillPlus
                          }
                        : {
                              type: "normal",
                              info: data.studentInfo.skills.normalSkill
                          },
                    /* eslint-enable indent */
                    {
                        type: "passivePlus",
                        info: data.studentInfo.skills.passiveSkillPlus
                    }
                )
            } else {
                tmpArr.push(
                    {
                        type: "normal",
                        info: data.studentInfo.skills.normalSkill
                    },
                    {
                        type: "passive",
                        info: data.studentInfo.skills.passiveSkill
                    }
                )
            }

            tmpArr.push({
                type: "sub",
                info: data.studentInfo.skills.subSkill
            })

            return tmpArr
        })()

        return skills
    }

    function formatSkillDesc(skill: StudentSkillInfo | StudentExSkillInfo, level: number): string {
        let desc = skill.skillDesc
        Array.from(desc.matchAll(/\{p\d\}/g)).forEach((placeholder, index) => {
            const value = skill.parameters[index][level - 1]
            desc = desc.replace(placeholder[0], value)
        })

        return desc.replaceAll(SKILL_EFFECT_VALUE_REGEX, "<b class='skill-param'>$&</b>")
    }

    $: {
        // Update basicParams when referenceLevel is updated
        referenceLevel = Utils.limitVariableRange(referenceLevel, 1, CURRENT_LEVEL_CAP)
        basicParams = calculateBasicParams()
    }

    $: {
        equipmentTier = Utils.limitVariableRange(equipmentTier, 1, LATEST_EQUIPMENT_TIER)
    }

    $: {
        exSkillLevel = Utils.limitVariableRange(exSkillLevel, 1, 5)
    }

    $: {
        commonSkillLevel = Utils.limitVariableRange(commonSkillLevel, 1, 10)
    }

    $: {
        displayedEquipments = setDisplayedEquipments(data.studentInfo, equipmentTier)
    }

    $: {
        isPlusSkillSelected // Make reactive
        displayedSkills = setDisplayedSkills()
    }
</script>

<svelte:head>
    <meta name="description" content="ゲーム「ブルーアーカイブ（ブルアカ）」に登場する生徒「{data.studentInfo.name}」の詳細ページ" />
</svelte:head>

<h1 class="visually-hidden">生徒詳細ビュー：{data.studentInfo.name}</h1>

<section id="student-detail-container">
    <section id="student-portrait">
        <img src="/asset/image/student/portrait/{data.studentInfo.name}.webp" alt="生徒「{data.studentInfo.name}」の立ち絵" />
    </section>
    <div id="student-details" class="strict-break">
        <section class="student-detail">
            <h2>プロフィール</h2>
            <ul class="student-detail-list">
                {#each PROFILE_LABEL_NAMES as profileLabelName}
                    <li class="list-element">
                        <span class="list-label">{profileLabelName.name}</span>
                        <span class="list-value">
                            {#if profileLabelName.id == "fullName"}
                                {data.studentInfo.fullName.replace(/（.+）/, "")}
                            {:else if profileLabelName.id == "birthday"}
                                {data.studentInfo.birthday.month}/{data.studentInfo.birthday.day}
                            {:else}
                                {data.studentInfo[profileLabelName.id]}
                            {/if}
                        </span>
                    </li>
                {/each}
            </ul>
        </section>
        <section class="student-detail">
            <h2>ステータス</h2>
            <div class="level-input-field">
                <input type="range" bind:value={referenceLevel} min="1" max={CURRENT_LEVEL_CAP} />
                <label>
                    <span>Lv.</span>
                    <input type="number" bind:value={referenceLevel} min="1" max={CURRENT_LEVEL_CAP} />
                </label>
            </div>
            <ul class="student-detail-list">
                {#each basicParams as param}
                    <li class="list-element">
                        <span class="list-label">{param.key}</span>
                        <span class="list-value">{param.value}</span>
                    </li>
                {/each}
                {#each PARAMS_LABEL_NAMES as paramsLabelName}
                    <li class="list-element">
                        <span class="list-label">{paramsLabelName.name}</span>
                        <span class="list-value">{data.studentInfo.params[paramsLabelName.id]}</span>
                    </li>
                {/each}
            </ul>
        </section>
        <section class="student-detail">
            <h2>装備品</h2>
            <div class="level-input-field">
                <input type="range" bind:value={equipmentTier} min="1" max={LATEST_EQUIPMENT_TIER} />
                <label>
                    <span>Tier</span>
                    <input type="number" bind:value={equipmentTier} min="1" max={LATEST_EQUIPMENT_TIER} />
                </label>
            </div>
            <ul class="student-equipment-list">
                {#each displayedEquipments as equipment}
                    <li class="equipment">
                        <a href="/items/{equipment.name}" class="equipment-container-top">
                            <img class="equipment-icon" src="/asset/image/item/{equipment.name}.webp" alt={equipment.name} />
                            <div class="equipment-info">
                                <span class="equipment-category-tier">{equipment.equipmentCategory}・T{equipment.tier}</span>
                                <h3 class="equipment-name">{equipment.name}</h3>
                            </div>
                        </a>
                        <ul class="equipment-params">
                            {#each equipment.params as param}
                                <li class="list-element">
                                    <span class="list-label">{EQUIPMENT_PARAMS_DICT[param.paramType]}</span>
                                    <span class="list-value">+{param.paramValue}</span>
                                </li>
                            {/each}
                        </ul>
                    </li>
                {/each}
            </ul>
        </section>
        <section class="student-detail">
            <h2>スキル</h2>
            <div class="level-input-field">
                <input type="range" bind:value={exSkillLevel} min="1" max="5" />
                <label>
                    <span>Lv.</span>
                    <input type="number" bind:value={exSkillLevel} min="1" max="5" />
                </label>
            </div>
            <ul class="student-skill-list">
                <li class="skill">
                    <div class="skill-type">EXスキル</div>
                    <div class="skill-name">
                        <h3>{data.studentInfo.skills.exSkill.skillName}</h3>
                        <span>COST: {data.studentInfo.skills.exSkill.costs[exSkillLevel - 1]}</span>
                    </div>
                    <p class="skill-desc">
                        {@html formatSkillDesc(data.studentInfo.skills.exSkill, exSkillLevel)}
                    </p>
                </li>
            </ul>
            <h3 class="annotation">スキルの強化に必要な素材</h3>
            {#if exSkillLevel - 1 < data.studentInfo.exSkillUpgradeRequirements.length}
                <ul class="skill-upgrade-requirements">
                    {#each data.studentInfo.exSkillUpgradeRequirements[exSkillLevel - 1] as item}
                        <li class="skill-upgrade-requirement">
                            <a href="/items/{item.itemName}">
                                <img src="/asset/image/item/{item.itemName}.webp" alt={item.itemName} />
                                <span>×{item.quantity}</span>
                            </a>
                        </li>
                    {/each}
                </ul>
            {:else}
                <div class="skill-level-max-dialogue">
                    <p>スキルが最大レベルに達しました。</p>
                </div>
            {/if}
            <div class="level-input-field">
                <input type="range" bind:value={commonSkillLevel} min="1" max="10" />
                <label>
                    <span>Lv.</span>
                    <input type="number" bind:value={commonSkillLevel} min="1" max="10" />
                </label>
            </div>
            <span class="plus-skill-selector">
                <input id="plus-skill-toggle" type="checkbox" bind:checked={isPlusSkillSelected} />
                <label for="plus-skill-toggle">+スキルを表示</label>
            </span>
            <ul class="student-skill-list">
                {#each displayedSkills as skill}
                    <li class="skill">
                        <div class="skill-type">{SKILL_TYPE_LABEL_DICT[skill.type]}</div>
                        <div class="skill-name">
                            <h3>{skill.info.skillName}</h3>
                        </div>
                        <p class="skill-desc">
                            {@html formatSkillDesc(skill.info, commonSkillLevel)}
                        </p>
                    </li>
                {/each}
            </ul>
            <h3 class="annotation">スキルの強化に必要な素材</h3>
            {#if commonSkillLevel - 1 < data.studentInfo.commonSkillUpgradeRequirements.length}
                <ul class="skill-upgrade-requirements">
                    {#each data.studentInfo.commonSkillUpgradeRequirements[commonSkillLevel - 1] as item}
                        <li class="skill-upgrade-requirement">
                            <a href="/items/{item.itemName}">
                                <img src="/asset/image/item/{item.itemName}.webp" alt={item.itemName} />
                                <span>×{item.quantity}</span>
                            </a>
                        </li>
                    {/each}
                </ul>
            {:else}
                <div class="skill-level-max-dialogue">
                    <p>スキルが最大レベルに達しました。</p>
                </div>
            {/if}
        </section>
    </div>
</section>

<style lang="scss">
    :root {
        --dashed-border: dashed 0.075rem var(--color-medium-04);
    }

    #student-detail-container {
        display: flex;

        #student-portrait {
            position: sticky;
            will-change: transform;
            top: 9rem;
            z-index: 0;
            width: 40%;
            height: calc(100svh - var(--header-height) - 9rem);

            img {
                position: absolute;
                top: 0;
                left: 50%;
                width: 90vw;
                height: 100%;
                transform: translateX(-50%);
                object-fit: contain;
                object-position: center;
            }
        }

        #student-details {
            display: flex;
            flex-direction: column;
            gap: 2.5rem;
            width: 60%;

            .student-detail {
                position: relative;
                box-sizing: border-box;
                padding: 1rem;
                background: var(--solid-shadow-block-background);
                border: var(--solid-shadow-block-border);

                h2 {
                    padding-bottom: 1rem;
                    font-size: 1.25rem;
                    font-weight: 600;
                    text-align: center;
                    border-bottom: solid 0.075rem var(--color-medium-04);
                }

                h3.annotation {
                    $border: solid 0.075rem var(--color-medium-03);

                    margin: 0.875rem 0.625rem 0;
                    font-size: 0.95rem;
                    line-height: 1.5;
                    text-align: center;
                    border-top: $border;
                    border-bottom: $border;
                }

                .level-input-field {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    height: 1.5rem;
                    margin: 0.5rem 0.625rem;

                    input[type="range"] {
                        width: 100%;
                        height: 0.225rem;
                        appearance: none;
                        background-color: var(--color-medium-02);
                        border-radius: 9999vh;

                        // NOTE: Comma splitting doesn't work for some reason. Style extending too
                        &::-webkit-slider-thumb {
                            width: 0.875rem;
                            height: 0.875rem;
                            appearance: none;
                            cursor: pointer;
                            background-color: var(--color-medium-04);
                            border-radius: 9999vh;
                        }

                        &::-moz-range-thumb {
                            width: 0.825rem;
                            height: 0.825rem;
                            appearance: none;
                            cursor: pointer;
                            background-color: var(--color-medium-04);
                            border: none;
                            border-radius: 9999vh;
                        }
                    }

                    label {
                        display: flex;
                        gap: 0.175rem;
                        align-items: center;
                        height: 0.925rem;
                        font-size: 0.925rem;

                        input[type="number"] {
                            width: 1.275rem;
                            font-family: inherit;
                            font-size: inherit;
                            text-decoration: underline;
                            appearance: textfield;
                            background-color: transparent;
                            border: none;

                            &::-webkit-inner-spin-button {
                                margin: 0;
                                appearance: none;
                            }

                            &::before {
                                display: block;
                                content: "Lv.";
                            }
                        }
                    }
                }

                .plus-skill-selector {
                    position: relative;
                    display: inline-block;
                    width: fit-content;
                    height: fit-content;
                    margin: 0 0.75rem 0.625rem;

                    label {
                        box-sizing: border-box;
                        display: inline-block;
                        padding: 0.275rem 0.75rem;
                        font-size: 0.95rem;
                        font-feature-settings: "palt";
                        letter-spacing: 0.0625rem;
                        white-space: nowrap;
                        user-select: none;
                        background-color: var(--color-main-01);
                        border: solid 0.1rem var(--color-medium-03);
                        border-radius: 0.275rem;
                        transition:
                            border-color 0.25s,
                            background-color 0.25s;
                    }

                    input {
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        appearance: none;
                    }

                    input:checked + label {
                        color: var(--color-white);
                        background-color: var(--color-dominant);
                        border-color: var(--color-main-02);
                    }
                }

                .student-detail-list {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    padding: 0 0.5rem;
                    margin-top: 0.175rem;
                    list-style: none;

                    .list-element {
                        box-sizing: border-box;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 47.5%;
                        padding: 0.5rem 0.625rem;
                        border-bottom: var(--dashed-border);

                        .list-label {
                            font-size: 0.925rem;
                            color: var(--color-medium-04);
                        }
                    }
                }

                .student-equipment-list {
                    display: flex;
                    flex-direction: column;
                    padding: 0 0.625rem;

                    .equipment {
                        padding: 0.5rem 0.5rem 0.625rem;
                        border-bottom: var(--dashed-border);

                        .equipment-container-top {
                            display: flex;
                            align-items: center;
                            width: fit-content;
                            padding-bottom: 0.75rem;

                            .equipment-icon {
                                width: auto;
                                height: 3.75rem;
                            }

                            .equipment-info {
                                margin-left: 0.75rem;

                                .equipment-category-tier {
                                    font-size: 0.925rem;
                                    color: var(--color-medium-04);
                                }

                                h3 {
                                    margin-top: 0.325rem;
                                }
                            }
                        }

                        .equipment-params {
                            display: flex;
                            flex-direction: column;
                            gap: 0.625rem;
                            padding: 0.75rem 0.625rem 0.25rem;
                            border-top: solid 0.075rem var(--color-medium-03);

                            .list-element {
                                display: flex;
                                gap: 0.5rem;
                                align-items: center;

                                .list-label {
                                    font-size: 0.925rem;
                                    color: var(--color-medium-04);
                                }
                            }
                        }
                    }
                }

                .student-skill-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    padding: 0 0.625rem;

                    .skill {
                        display: flex;
                        flex-direction: column;
                        gap: 0.325rem;
                        padding: 0 0.5rem;
                        padding-bottom: 0.75rem;
                        border-bottom: var(--dashed-border);

                        .skill-type {
                            font-size: 0.925rem;
                            color: var(--color-medium-04);
                        }

                        .skill-name {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;

                            h3 {
                                font-size: 1.125rem;
                            }

                            span {
                                font-size: 0.925rem;
                                color: var(--color-medium-04);
                            }
                        }

                        .skill-desc {
                            line-height: 1.25;
                        }

                        &:last-of-type {
                            padding-bottom: 0;
                            border: none;
                        }
                    }
                }

                .skill-upgrade-requirements {
                    display: flex;
                    gap: 0.875rem;
                    justify-content: center;
                    padding: 0.425rem 1.125rem 0;

                    .skill-upgrade-requirement {
                        display: flex;
                        flex-direction: column;
                        gap: 0.125rem;
                        align-items: center;

                        a {
                            display: contents;

                            img {
                                width: auto;
                                height: 3.75rem;
                            }

                            span {
                                width: 92.5%;
                                padding: 0.075rem 0;
                                font-size: 0.925rem;
                                color: var(--color-main-01);
                                text-align: center;
                                background-color: var(--color-main-02);
                                border-radius: 0.125rem;

                                @media (max-width: 1280px) {
                                    width: 87.5%;
                                    font-size: 0.9125rem;
                                }
                            }
                        }
                    }

                    @media (max-width: 1280px) {
                        gap: 0.15rem;
                    }
                }

                .skill-level-max-dialogue {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 4.875rem;
                    padding-top: 0.5rem;

                    p {
                        font-size: 0.925rem;
                        color: var(--color-medium-04);
                    }
                }

                &::after {
                    position: absolute;
                    top: 0.65rem;
                    left: 0.65rem;
                    z-index: -1;
                    width: 100%;
                    height: 100%;
                    content: "";
                    background: var(--color-dominant);
                    border: var(--solid-shadow-block-border);
                }
            }
        }
    }

    @media (max-width: 1280px) {
        #student-detail-container {
            position: relative;
            flex-direction: column;

            section {
                width: var(--body-width);
            }

            #student-portrait {
                position: fixed;
                top: calc(50% + 1rem);
                left: 50%;
                z-index: -1;
                height: 72svh;
                transform: translate(-50%, -50%);

                img {
                    position: absolute;
                    top: 0;
                    width: 100svh;
                }
            }

            #student-details {
                width: var(--body-width);
                margin-top: 72svh;

                .student-detail {
                    &::after {
                        top: 0.625rem;
                        left: 0.625rem;
                    }

                    .student-detail-list {
                        .list-element {
                            flex-direction: column;
                            gap: 0.25rem;
                            align-items: start;

                            .list-label {
                                font-size: 0.875rem;
                            }
                        }
                    }
                }
            }
        }
    }
</style>
