<script lang="ts">
    import { STUDENT_ATK_TYPES, STUDENT_CLASS_TYPES, STUDENT_DEF_TYPES, STUDENT_LANDSCAPE_APT_ORDER, STUDENT_POSITION_TYPES, STUDENT_ROLE_TYPES, STUDENT_SCHOOL_TYPES, type StudentAttackAttr, type StudentClass, type StudentDefenceAttr, type StudentInfo, type StudentPosition, type StudentRole, type StudentSchool } from "$lib/types"
    import Students from "$lib/datas/studentList.json"
    import CrossButtonIcon from "$lib/components/CrossButtonIcon.svelte"
    import HeadlineGroup from "$lib/components/HeadlineGroup.svelte"
    import { toggleListControlMenu } from "$lib/utils"
    import { mediaServerDomain } from "$lib/site.config"

    type FilterCondition = {
        role: StudentRole[]
        atkAttr: StudentAttackAttr[]
        defAttr: StudentDefenceAttr[]
        position: StudentPosition[]
        class: StudentClass[]
        school: StudentSchool[]
    }

    const SORT_CONDITIONS = [
        {
            label: "名前（昇順）",
            id: "nameAsc"
        },
        {
            label: "名前（降順）",
            id: "nameDsc"
        },
        {
            label: "レア度（昇順）",
            id: "starGradeAsc"
        },
        {
            label: "レア度（降順）",
            id: "starGradeDsc"
        },
        {
            label: "市街地適性",
            id: "townApt"
        },
        {
            label: "屋外適性",
            id: "outdoorApt"
        },
        {
            label: "屋内適性",
            id: "indoorApt"
        },
        {
            label: "誕生日（昇順）",
            id: "birthdayAsc"
        },
        {
            label: "誕生日（降順）",
            id: "birthdayDsc"
        }
    ] as const

    const PAGE_DESCRIPTION = "このページでは全生徒の概要を表示しています。詳細ビューへは生徒のカードから移動できます。"

    let students = structuredClone(Students) as StudentInfo[]
    let filterCondition: FilterCondition = {
        role: [],
        atkAttr: [],
        defAttr: [],
        position: [],
        class: [],
        school: []
    }
    let sortOrder: "default" | (typeof SORT_CONDITIONS)[number]["id"] = "default"
    let isListControlMenuOpened = false
    let listControlMenu: HTMLElement

    function sortStudentList() {
        switch (sortOrder) {
            case "default":
                break
            case "nameAsc":
                students.sort((a, b) => {
                    if (a.name < b.name) return -1
                    if (a.name > b.name) return 1
                    return 0
                })
                break
            case "nameDsc":
                students.sort((a, b) => {
                    if (a.name > b.name) return -1
                    if (a.name < b.name) return 1
                    return 0
                })
                break
            case "starGradeAsc":
                students.sort((a, b) => {
                    if (a.starGrade < b.starGrade) return -1
                    if (a.starGrade > b.starGrade) return 1
                    return 0
                })
                break
            case "starGradeDsc":
                students.sort((a, b) => {
                    if (a.starGrade > b.starGrade) return -1
                    if (a.starGrade < b.starGrade) return 1
                    return 0
                })
                break
            case "townApt":
            case "outdoorApt":
            case "indoorApt": {
                const aptType = sortOrder // NOTE: Nesting breakes type inference, so store in a variable
                students.sort((a, b) => {
                    if (STUDENT_LANDSCAPE_APT_ORDER.indexOf(a[aptType]) < STUDENT_LANDSCAPE_APT_ORDER.indexOf(b[aptType])) return -1
                    if (STUDENT_LANDSCAPE_APT_ORDER.indexOf(a[aptType]) > STUDENT_LANDSCAPE_APT_ORDER.indexOf(b[aptType])) return 1
                    return 0
                })
                break
            }
            case "birthdayAsc":
                students.sort((a, b) => {
                    if (a.birthday == null) return 1
                    if (b.birthday == null) return -1
                    if (new Date(`${a.birthday.month}/${a.birthday.day}`) < new Date(`${b.birthday.month}/${b.birthday.day}`)) return -1
                    if (new Date(`${a.birthday.month}/${a.birthday.day}`) > new Date(`${b.birthday.month}/${b.birthday.day}`)) return 1
                    return 0
                })
                break
            case "birthdayDsc":
                students.sort((a, b) => {
                    if (a.birthday == null) return 1
                    if (b.birthday == null) return -1
                    if (new Date(`${a.birthday.month}/${a.birthday.day}`) > new Date(`${b.birthday.month}/${b.birthday.day}`)) return -1
                    if (new Date(`${a.birthday.month}/${a.birthday.day}`) < new Date(`${b.birthday.month}/${b.birthday.day}`)) return 1
                    return 0
                })
                break
        }
    }

    function filterStudentList() {
        if (Object.values(filterCondition).every((value) => value.length == 0)) {
            return
        }

        students = students.filter((student) => {
            if (filterCondition.role.length > 0 && !filterCondition.role.includes(student.role)) {
                return false
            }
            if (filterCondition.atkAttr.length > 0 && !filterCondition.atkAttr.includes(student.atkAttr)) {
                return false
            }
            if (filterCondition.defAttr.length > 0 && !filterCondition.defAttr.includes(student.defAttr)) {
                return false
            }
            if (filterCondition.position.length > 0 && !filterCondition.position.includes(student.position)) {
                return false
            }
            if (filterCondition.class.length > 0 && !filterCondition.class.includes(student.class)) {
                return false
            }
            if (filterCondition.school.length > 0 && !filterCondition.school.includes(student.school)) {
                return false
            }
            return true
        })
    }

    function reComputeStudentList() {
        students = structuredClone(Students) as StudentInfo[]
        sortStudentList()
        filterStudentList()
    }

    $: {
        sortOrder, filterCondition
        reComputeStudentList()
    }

    /** @type {import('./$types').Snapshot<string>} */
    export const snapshot = {
        capture: () => [sortOrder, filterCondition],
        restore: (value: [typeof sortOrder, FilterCondition]) => ([sortOrder, filterCondition] = value)
    }
</script>

<svelte:head>
    <meta name="description" content="ゲーム「ブルーアーカイブ（ブルアカ）」の生徒一覧ページです。{PAGE_DESCRIPTION}" />
</svelte:head>

<HeadlineGroup pageTitle="生徒名簿" pageDescription={PAGE_DESCRIPTION} />
<div id="menu-toggle-button">
    <input type="checkbox" id="menu-toggle" bind:checked={isListControlMenuOpened} on:change={() => toggleListControlMenu(listControlMenu, isListControlMenuOpened)} />
    <label for="menu-toggle" id="menu-toggle-label">
        <CrossButtonIcon isOpen={isListControlMenuOpened} iconSize="1.05rem" />
        <span>並べ替え・絞り込みメニューを{isListControlMenuOpened ? "閉じる" : "開く"}</span>
    </label>
</div>
<section id="data-controls" style="height: 0;margin-bottom: 0;" bind:this={listControlMenu}>
    <section>
        <h2>ソート順</h2>
        <div id="sort-order-selectors" class="selectors">
            <span class="selector">
                <input type="radio" name="sort-order" id="sort-order-selector-default" tabindex={isListControlMenuOpened ? 0 : -1} bind:group={sortOrder} value="default" checked />
                <label for="sort-order-selector-default">デフォルト</label>
            </span>
            {#each SORT_CONDITIONS as condition}
                <span class="selector">
                    <input type="radio" name="sort-order" id="sort-order-selector-{condition.id}" tabindex={isListControlMenuOpened ? 0 : -1} bind:group={sortOrder} value={condition.id} />
                    <label for="sort-order-selector-{condition.id}">{condition.label}</label>
                </span>
            {/each}
        </div>
    </section>
    <section>
        <h2>フィルター</h2>
        <section>
            <h3>役割</h3>
            <div class="selectors packed">
                {#each STUDENT_ROLE_TYPES as role}
                    <span class="selector">
                        <input type="checkbox" id="role-selector-{role}" tabindex={isListControlMenuOpened ? 0 : -1} bind:group={filterCondition.role} value={role} />
                        <label for="role-selector-{role}">{role}</label>
                    </span>
                {/each}
            </div>
        </section>
        <section>
            <h3>攻撃属性</h3>
            <div class="selectors packed">
                {#each STUDENT_ATK_TYPES as atk}
                    <span class="selector">
                        <input type="checkbox" id="role-selector-{atk}" tabindex={isListControlMenuOpened ? 0 : -1} bind:group={filterCondition.atkAttr} value={atk} />
                        <label for="role-selector-{atk}">{atk}</label>
                    </span>
                {/each}
            </div>
        </section>
        <section>
            <h3>防御属性</h3>
            <div class="selectors packed">
                {#each STUDENT_DEF_TYPES as def}
                    <span class="selector">
                        <input type="checkbox" id="role-selector-{def}" tabindex={isListControlMenuOpened ? 0 : -1} bind:group={filterCondition.defAttr} value={def} />
                        <label for="role-selector-{def}">{def}</label>
                    </span>
                {/each}
            </div>
        </section>
        <section>
            <h3>ポジション</h3>
            <div class="selectors packed">
                {#each STUDENT_POSITION_TYPES as position}
                    <span class="selector">
                        <input type="checkbox" id="role-selector-{position}" tabindex={isListControlMenuOpened ? 0 : -1} bind:group={filterCondition.position} value={position} />
                        <label for="role-selector-{position}">{position}</label>
                    </span>
                {/each}
            </div>
        </section>
        <section>
            <h3>クラス</h3>
            <div class="selectors packed">
                {#each STUDENT_CLASS_TYPES as cls}
                    <span class="selector">
                        <input type="checkbox" id="role-selector-{cls}" tabindex={isListControlMenuOpened ? 0 : -1} bind:group={filterCondition.class} value={cls} />
                        <label for="role-selector-{cls}">{cls}</label>
                    </span>
                {/each}
            </div>
        </section>
        <section>
            <h3>学校</h3>
            <div class="selectors packed">
                {#each STUDENT_SCHOOL_TYPES as school}
                    <span class="selector">
                        <input type="checkbox" id="role-selector-{school}" tabindex={isListControlMenuOpened ? 0 : -1} bind:group={filterCondition.school} value={school} />
                        <label for="role-selector-{school}">{school}</label>
                    </span>
                {/each}
            </div>
        </section>
    </section>
</section>

<section id="students">
    {#each students as student}
        <a class="student" href="/students/{student.name}">
            <div class="student-container-top">
                <span class="student-role" data-student-role={student.role} />
                <span class="student-icon" style="background-image: url(//{mediaServerDomain}/student/icon/{student.name}.webp);" />
                <div class="student-name-container">
                    <p class="student-name-ruby">{student.ruby}</p>
                    <p class="student-name-base strict-break" aria-hidden="true">{student.fullName}</p>
                </div>
            </div>
            <div class="student-container-bottom">
                <span class="overview-param" data-student-attack-type={student.atkAttr}>{student.atkAttr}</span>
                <span class="overview-param" data-student-defence-type={student.defAttr}>{student.defAttr}</span>
                <span class="overview-param">{student.position}</span>
                {#if sortOrder == "starGradeAsc" || sortOrder == "starGradeDsc"}
                    <span class="overview-param">{student.starGrade}</span>
                {:else if sortOrder == "townApt"}
                    <span class="overview-param" data-student-landscape-apt={student.townApt}>市街地適性{student.townApt}</span>
                {:else if sortOrder == "outdoorApt"}
                    <span class="overview-param" data-student-landscape-apt={student.outdoorApt}>屋外適性{student.outdoorApt}</span>
                {:else if sortOrder == "indoorApt"}
                    <span class="overview-param" data-student-landscape-apt={student.indoorApt}>屋内適性{student.indoorApt}</span>
                {:else if sortOrder == "birthdayAsc" || sortOrder == "birthdayDsc"}
                    {#if student.birthday == null}
                        <span class="overview-param">（不明）</span>
                    {:else}
                        <span class="overview-param">{student.birthday.month}月{student.birthday.day}日</span>
                    {/if}
                {:else}
                    <span class="overview-param">{student.class}</span>
                {/if}
            </div>
        </a>
    {/each}
</section>

<style lang="scss">
    #menu-toggle-button {
        position: relative;
        display: inline-block;
        margin-bottom: 1rem;

        label {
            display: flex;
            gap: 0.325rem;
            align-items: center;
            height: 1.05rem;
            padding: 0.15rem 0;
            margin-inline: 0.2rem;
            font-size: 1.05rem;

            span {
                white-space: nowrap;
            }
        }

        input {
            position: absolute;
            width: 100%;
            height: 100%;
            appearance: none;
        }
    }

    #data-controls {
        overflow-y: clip;
        transition-property: height, margin-bottom;

        h2 {
            margin: 0.875rem 0;
            font-size: 1.25rem;
        }

        section {
            h3 {
                margin: 0.5rem 0;
                font-size: 1.125rem;
                font-weight: normal;
            }
        }

        .selectors {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;

            // TODO: Firefoxが:hasセレクタに正式対応したら、label要素がラジオボタンを内包するように書き直す
            .selector {
                position: relative;

                label {
                    box-sizing: border-box;
                    display: block;
                    padding: 0.275rem 0.825rem;
                    font-size: 0.95rem;
                    font-feature-settings: "palt";
                    letter-spacing: 0.0625rem;
                    white-space: nowrap;
                    user-select: none;
                    background-color: var(--color-main-01);
                    border: solid 0.1rem var(--color-medium-03);
                    border-radius: 0.275rem;
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

            &.packed {
                justify-content: flex-start;
            }
        }
    }

    #students {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(25rem, 1fr));
        gap: 3rem;
        width: var(--body-width);
        margin: 0 auto;
    }

    .student {
        position: relative;
        box-sizing: border-box;
        display: inline-block;
        padding: 1rem 1.5rem;
        background-image: var(--solid-shadow-block-background);
        border: var(--solid-shadow-block-border);

        .student-container-top {
            display: flex;
            align-items: center;
            margin-bottom: 1rem;

            .student-role {
                position: absolute;
                display: block;
                width: 3.75rem;
                height: 3.75rem;
                border-radius: 0.35rem;

                &[data-student-role="STRIKER"] {
                    background-color: var(--color-student-role-striker);
                }

                &[data-student-role="SPECIAL"] {
                    background-color: var(--color-student-role-special);
                }
            }

            .student-icon {
                z-index: 0;
                min-width: 3.75rem;
                min-height: 3.75rem;
                margin-left: 0.425rem;
                background-color: var(--color-medium-02);
                background-position: center top;
                background-size: cover;
                border-radius: 0.35rem;
            }

            .student-name-container {
                margin-left: 1rem;

                .student-name-base {
                    font-size: 1.575rem;
                    line-height: 1.125;
                }

                .student-name-ruby {
                    font-size: 1rem;
                }
            }
        }

        .student-container-bottom {
            display: flex;
            flex-wrap: wrap;
            gap: 0.425rem;

            .overview-param {
                padding: 0.175rem 1.25rem;
                color: var(--color-white);
                word-break: keep-all;
                background-color: var(--color-student-param-misc);
                border-radius: 9999vh;

                &[data-student-attack-type="爆発"],
                &[data-student-defence-type="軽装"] {
                    background-color: var(--color-student-param-red);
                }

                &[data-student-attack-type="貫通"],
                &[data-student-defence-type="重装"] {
                    background-color: var(--color-student-param-yellow);
                }

                &[data-student-attack-type="神秘"],
                &[data-student-defence-type="特殊"] {
                    background-color: var(--color-student-param-blue);
                }

                &[data-student-attack-type="振動"],
                &[data-student-defence-type="弾力"] {
                    background-color: var(--color-student-param-purple);
                }

                &[data-student-landscape-apt="S"],
                &[data-student-landscape-apt="A"] {
                    background-color: var(--color-student-landscape-apt-green);
                }

                &[data-student-landscape-apt="B"] {
                    background-color: var(--color-student-landscape-apt-yellow);
                }

                &[data-student-landscape-apt="C"],
                &[data-student-landscape-apt="D"] {
                    background-color: var(--color-student-landscape-apt-red);
                }
            }
        }

        &::after {
            position: absolute;
            top: 0.575rem;
            left: 0.575rem;
            z-index: -1;
            width: 100%;
            height: 100%;
            content: "";
            background-color: var(--color-dominant);
            border: inherit;
        }

        &:hover {
            text-decoration: none;
        }
    }

    @media (max-width: 1280px) {
        #data-controls {
            .selectors {
                justify-content: normal;
            }
        }

        #students {
            grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
        }
    }
</style>
