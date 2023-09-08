<script lang="ts">
    import HeadlineGroup from "$lib/components/HeadlineGroup.svelte"
    import Logo from "$lib/components/Logo.svelte"
    import PositionMoveButton from "$lib/components/PositionMoveButton.svelte"
    import RemoveButton from "$lib/components/RemoveButton.svelte"
    import { STUDENT_ROLE_TYPES, type StudentInfo, type StudentRole } from "$lib/types"
    import { Utils, searchStudent } from "$lib/utils"
    import html2canvas from "html2canvas"

    type Unit = {
        desc: string
        students: {
            striker: (StudentInfo | undefined)[]
            special: (StudentInfo | undefined)[]
        }
    }

    const unitTemplate: Unit = {
        desc: "",
        students: {
            striker: [],
            special: []
        }
    }

    const units: Unit[] = [structuredClone(unitTemplate)]

    let renderUnitsElement: HTMLElement
    let currentryFocusedSearchFieldID: string | null = null
    let searchResult: StudentInfo[] | null = null

    const PAGE_DESCRIPTION = "SNS等で共有可能な部隊編成の画像を作成できるツールです。"

    function search(event: Event, role: StudentRole, fieldID: string) {
        const name = (event.target as HTMLInputElement).value
        const result = searchStudent(name, role)

        searchResult = result
        currentryFocusedSearchFieldID = fieldID
    }

    function swapStudentsIndex(unitIndex: number, role: StudentRole, studentIndex: number, direction: "up" | "down") {
        const unit = units[unitIndex]
        const students = role == "STRIKER" ? unit.students.striker : unit.students.special
        const targetIndex = direction == "up" ? studentIndex - 1 : studentIndex + 1
        if (targetIndex < 0 || targetIndex >= students.length) {
            return
        }
        const tmp = students[studentIndex]
        students[studentIndex] = students[targetIndex]
        students[targetIndex] = tmp

        units[unitIndex] = unit // NOTE: Tell Svelte that the array has been updated
    }

    function removeStudentInfo(unitIndex: number, role: StudentRole, studentIndex: number) {
        const unit = units[unitIndex]
        const students = role == "STRIKER" ? unit.students.striker : unit.students.special
        students[studentIndex] = undefined

        units[unitIndex] = unit
    }

    async function downloadUnitImage() {
        await html2canvas(renderUnitsElement, { scale: 1, width: 1080 }).then((renderResult) => {
            renderResult.toBlob(
                (blob) => {
                    if (blob == null) {
                        return
                    }
                    const tmpAnchorElement = document.createElement("a")
                    const link = URL.createObjectURL(blob)

                    const now = new Date()
                    const month = String(now.getMonth() + 1).padStart(2, "0")
                    const date = String(now.getDate()).padStart(2, "0")
                    const hour = String(now.getHours()).padStart(2, "0")
                    const minute = String(now.getMinutes()).padStart(2, "0")

                    tmpAnchorElement.href = link
                    tmpAnchorElement.download = `Unit_${now.getFullYear()}-${month}-${date}_${hour}-${minute}.png`

                    tmpAnchorElement.click()

                    URL.revokeObjectURL(link)
                },
                "image/png",
                0.7
            )
        })
    }
</script>

<svelte:head>
    <meta name="description" content={PAGE_DESCRIPTION} />
</svelte:head>

<HeadlineGroup pageTitle="編成画像メーカー" pageDescription={PAGE_DESCRIPTION} />
<div aria-hidden="true" id="render-units-container" bind:this={renderUnitsElement}>
    <section id="render-units">
        {#each units as unit}
            <section class="render-unit">
                <h2>部隊1{unit.desc ? `（${unit.desc}）` : ""}</h2>
                <section class="render-students">
                    {#each STUDENT_ROLE_TYPES as role}
                        {@const studentsNumber = role == "STRIKER" ? 4 : 2}
                        {#each Utils.generateNumberSequence(studentsNumber) as roleIndex}
                            {@const student = role == "STRIKER" ? unit.students.striker[roleIndex - 1] : unit.students.special[roleIndex - 1]}
                            {@const path = student != null ? `student/icon/${student.name}` : "empty"}
                            <section class="render-student">
                                <div class="render-student-role" data-student-role={role} />
                                <div class="render-student-icon" style="background-image: url(/asset/image/{path}.webp);" />
                            </section>
                        {/each}
                    {/each}
                </section>
            </section>
        {/each}
        <div id="logo-container">
            <p>Powered by</p>
            <span id="logo">
                <Logo />
            </span>
        </div>
    </section>
</div>

<ol id="units">
    <li>
        {#each Utils.generateNumberSequence(units.length) as unitIndex}
            <ol class="unit">
                <div class="unit-description">
                    <h2>部隊{unitIndex}</h2>
                    <input type="text" placeholder="部隊の説明" bind:value={units[unitIndex - 1].desc} />
                </div>
                {#each STUDENT_ROLE_TYPES as role}
                    {@const studentsNumber = role == "STRIKER" ? 4 : 2}
                    {#each Utils.generateNumberSequence(studentsNumber) as roleIndex}
                        {@const student = role == "STRIKER" ? units[unitIndex - 1].students.striker[roleIndex - 1] : units[unitIndex - 1].students.special[roleIndex - 1]}
                        {#if student == null}
                            <li class="student-search-field-container">
                                <div class="student-search-field">
                                    <input type="text" placeholder="生徒を検索" on:input={(event) => search(event, role, `Unit${unitIndex}-${role}-Student${roleIndex}`)} />
                                    <ul class="search-results">
                                        {#if searchResult != null && currentryFocusedSearchFieldID == `Unit${unitIndex}-${role}-Student${roleIndex}`}
                                            {#each searchResult as result}
                                                <li class="result">
                                                    <button on:click={() => (role == "STRIKER" ? (units[unitIndex - 1].students.striker[roleIndex - 1] = result) : (units[unitIndex - 1].students.special[roleIndex - 1] = result))}>
                                                        <span class="result-name">{result.name}</span>
                                                        <span class="param" data-student-attack-type={result.atkAttr}>{result.atkAttr}</span>
                                                        <span class="param" data-student-defence-type={result.defAttr}>{result.defAttr}</span>
                                                    </button>
                                                </li>
                                            {/each}
                                        {:else}
                                            <p class="no-result-message">検索対象の生徒が見つかりませんでした。</p>
                                        {/if}
                                    </ul>
                                </div>
                            </li>
                        {:else if student != null}
                            <li class="student">
                                <div class="student-icon">
                                    <div class="role" data-student-role={role} />
                                    <div class="icon" style="background-image: url(/asset/image/student/icon/{student.name}.webp);" />
                                </div>
                                <p class="student-name">{student.name}</p>
                                <span class="student-params">
                                    <span class="param" data-student-attack-type={student.atkAttr}>{student.atkAttr}</span>
                                    <span class="param" data-student-defence-type={student.defAttr}>{student.defAttr}</span>
                                </span>
                                <div class="element-control-buttons">
                                    <PositionMoveButton
                                        onClick={() => {
                                            swapStudentsIndex(unitIndex - 1, role, roleIndex - 1, "up")
                                        }}
                                        direction="up"
                                    />
                                    <PositionMoveButton
                                        onClick={() => {
                                            swapStudentsIndex(unitIndex - 1, role, roleIndex - 1, "down")
                                        }}
                                        direction="down"
                                    />
                                    <RemoveButton onClick={() => removeStudentInfo(unitIndex - 1, role, roleIndex - 1)} />
                                </div>
                            </li>
                        {/if}
                    {/each}
                {/each}
            </ol>
        {/each}
    </li>
</ol>
<button type="button" on:click={downloadUnitImage}>画像を書き出し</button>

<style lang="scss">
    $border: solid 0.075rem var(--color-medium-03);

    #render-units-container {
        $base-font-size: 28px;
        //position: absolute;
        bottom: 100%;
        width: 1080px;
        box-sizing: border-box;
        padding: calc($base-font-size * 1.75) calc($base-font-size * 2) calc($base-font-size * 0.75);

        #render-units {
            display: flex;
            flex-direction: column;
            gap: calc($base-font-size * 1.5);
            font-size: $base-font-size; // デバイス間でのレイアウトを維持するため、以下の要素では"em"を使う

            .render-unit {
                position: relative;
                padding: 0.75em 1.25em;
                background-color: var(--color-white);
                border: var(--solid-shadow-block-border);

                h2 {
                    padding: 0 0.5em 0.75em;
                    font-size: inherit;
                    font-weight: 500;
                    border-bottom: dashed 0.075em var(--color-medium-04);
                    color: var(--color-black);
                }

                .render-students {
                    padding: 0.75em 0.5em;
                    padding-bottom: 0;
                    display: flex;
                    justify-content: space-between;

                    .render-student {
                        position: relative;

                        .render-student-role {
                            position: absolute;
                            display: block;
                            width: 3.25em;
                            height: 3.25em;
                            border-radius: 0.35em;

                            &[data-student-role="STRIKER"] {
                                background-color: var(--color-student-role-striker);
                            }

                            &[data-student-role="SPECIAL"] {
                                background-color: var(--color-student-role-special);
                            }
                        }

                        .render-student-icon {
                            position: inherit;
                            min-width: 3.25em;
                            min-height: 3.25em;
                            margin-left: 0.425em;
                            background-color: var(--color-medium-02);
                            background-position: center top;
                            background-size: cover;
                            border-radius: 0.35em;
                        }
                    }
                }

                &::after {
                    position: absolute;
                    top: 0.5em;
                    left: 0.5em;
                    z-index: -1;
                    width: 100%;
                    height: 100%;
                    content: "";
                    background: var(--color-dominant);
                    border: var(--solid-shadow-block-border);
                }
            }
        }

        #logo-container {
            transform: translateX(0.575em);
            margin-top: 1.75em;
            display: flex;
            align-items: center;
            justify-content: right;
            flex-wrap: nowrap;
            gap: 1em;

            p {
                color: var(--color-medium-03);
                font-size: 1.25em;
            }

            #logo {
                width: 14em;
            }
        }
    }

    #units {
        width: 75%;
        margin: 0 auto;
        display: flex;
        flex-direction: column;

        .unit {
            display: flex;
            flex-direction: column;

            .unit-description {
                border-top: $border;
                display: flex;
                gap: 1rem;
                padding: 0.75rem 1rem;
                background-color: var(--color-main-01);

                h2 {
                    font-weight: 500;
                }

                input {
                    appearance: none;
                    padding: 0.25rem 0.5rem;
                    box-sizing: border-box;
                    font-size: 0.925rem;
                    width: 50%;
                    background-color: var(--color-main-01);
                    border: $border;
                    border-radius: 0.25rem;
                    color: var(--color-medium-04);

                    &::placeholder {
                        color: var(--color-medium-04);
                    }
                }
            }

            .student-search-field-container,
            .student {
                width: inherit;
                padding: 1.4125rem 2rem;
                box-sizing: border-box;
                border-top: $border;
                background-color: var(--color-main-01);
            }

            .student-search-field-container {
                .student-search-field {
                    position: relative;

                    input {
                        display: block;
                        margin: 0 auto;
                        width: 90%;
                        appearance: none;
                        padding: 0.25rem 0.5rem;
                        box-sizing: border-box;
                        font-size: 0.925rem;
                        background-color: var(--color-main-01);
                        border: $border;
                        border-radius: 0.25rem;
                        color: var(--color-medium-04);

                        &::placeholder {
                            color: var(--color-medium-04);
                        }
                    }

                    .search-results {
                        flex-direction: column;
                        display: none;
                        position: absolute;
                        top: calc(100% + 0.25rem);
                        left: 50%;
                        transform: translateX(-50%);
                        font-size: 0.925rem;
                        width: 75%;
                        padding: 0.375rem;
                        box-sizing: border-box;
                        background-color: var(--color-main-01);
                        border: $border;
                        filter: drop-shadow(0 0.25rem 0.25rem var(--color-medium-02));
                        border-radius: 0.25rem;
                        color: var(--color-medium-04);
                        z-index: 1;

                        .result {
                            button {
                                display: flex;
                                width: 100%;
                                gap: 0.625rem;
                                align-items: center;
                                padding: 0.275rem 0.375rem;
                                font: inherit;
                                border: none;
                                border-radius: 0.25rem;
                                background-color: transparent;
                                transition-property: background-color;
                                transition-duration: 0.2s;

                                &:hover {
                                    background-color: var(--color-medium-02);
                                }
                            }
                        }
                    }

                    input:focus-within + .search-results,
                    .search-results:hover {
                        display: flex;
                    }

                    .no-result-message {
                        padding: 0.5rem 0.75rem;
                        color: var(--color-medium-03);
                    }
                }
            }

            .student {
                padding: 0.75rem 1.75rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;

                .student-icon {
                    position: relative;
                    margin-right: 0.75rem;
                    height: 3rem;
                    width: 3rem;
                    min-height: 3rem;
                    min-width: 3rem;

                    .role {
                        position: absolute;
                        //display: block;
                        height: inherit;
                        width: inherit;
                        border-radius: 0.25rem;

                        &[data-student-role="STRIKER"] {
                            background-color: var(--color-student-role-striker);
                        }

                        &[data-student-role="SPECIAL"] {
                            background-color: var(--color-student-role-special);
                        }
                    }

                    .icon {
                        position: relative;
                        min-width: inherit;
                        min-height: inherit;
                        margin-left: 0.4em;
                        background-color: var(--color-medium-02);
                        background-position: center top;
                        background-size: cover;
                        border-radius: 0.25em;
                    }
                }

                .student-params {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .element-control-buttons {
                    display: flex;
                    height: 1.125rem;
                    gap: 0.25rem;
                    margin-left: auto;
                }
            }

            .student:last-of-type,
            .student-search-field-container:last-of-type {
                border-bottom: $border;
            }
        }

        .param {
            font-size: 0.875rem;
            border-radius: 9999vh;
            padding: 0.175rem 1rem;
            color: var(--color-white);
            background-color: var(--color-student-param-misc);

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
        }
    }
</style>
