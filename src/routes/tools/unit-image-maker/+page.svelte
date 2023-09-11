<script lang="ts">
    import HeadlineGroup from "$lib/components/HeadlineGroup.svelte"
    import Logo from "$lib/components/Logo.svelte"
    import PositionMoveButton from "$lib/components/PositionMoveButton.svelte"
    import RemoveButton from "$lib/components/RemoveButton.svelte"
    import { STUDENT_ROLE_TYPES, type StudentInfo, type StudentRole } from "$lib/types"
    import { Utils, searchStudent } from "$lib/utils"
    import html2canvas from "html2canvas"
    import { isClipboardAPIAvailable } from "../../../hooks.client"

    type Unit = {
        desc: string
        students: {
            STRIKER: (StudentInfo | undefined)[]
            SPECIAL: (StudentInfo | undefined)[]
        }
        initialSkills: string[]
    }

    const unitTemplate: Unit = {
        desc: "",
        students: {
            STRIKER: [],
            SPECIAL: []
        },
        initialSkills: []
    }

    const renderingOption = {
        scale: 1,
        width: 1920
    }

    let units: Unit[] = [structuredClone(unitTemplate)]
    let renderUnitsElement: HTMLElement
    let currentryFocusedSearchFieldID: string | null = null
    let searchResult: StudentInfo[] | null = null
    let imageCopyButtonTextContent = "画像をコピー"

    const STUDENT_PARAMS_DICT = [
        {
            id: "atkAttr",
            name: ""
        },
        {
            id: "defAttr",
            name: ""
        }
    ] as const
    const PAGE_DESCRIPTION = "フォームに部隊の情報を入力することでSNS等で共有可能な部隊編成の画像を作成できるツールです。"

    function generateStudentsNameArray(unit: Unit, role: StudentRole) {
        return unit.students[role].map((student) => (student != null ? student.name : "")).filter((name) => name != "")
    }

    function search(event: Event, role: StudentRole, ignoreGroup: string[], fieldID: string) {
        const name = (event.target as HTMLInputElement).value
        const result = searchStudent(name, role, ignoreGroup)

        searchResult = result
        currentryFocusedSearchFieldID = fieldID
    }

    function swapStudentsIndex(unitIndex: number, role: StudentRole, studentIndex: number, direction: "up" | "down") {
        const unit = units[unitIndex]
        const students = role == "STRIKER" ? unit.students.STRIKER : unit.students.SPECIAL
        const targetIndex = direction == "up" ? studentIndex - 1 : studentIndex + 1
        if (targetIndex < 0 || targetIndex >= students.length) {
            return
        }
        const tmp = students[studentIndex]
        students[studentIndex] = students[targetIndex]
        students[targetIndex] = tmp

        units[unitIndex] = unit
    }

    function removeStudentInfo(unitIndex: number, role: StudentRole, studentIndex: number) {
        const unit = units[unitIndex]
        const students = role == "STRIKER" ? unit.students.STRIKER : unit.students.SPECIAL
        unit.initialSkills = unit.initialSkills.filter((name) => name != (students[studentIndex] as StudentInfo).name)
        students[studentIndex] = undefined

        units[unitIndex] = unit

        currentryFocusedSearchFieldID = null
    }

    function removeUnit(unitIndex: number) {
        units = units.filter((_, index) => index != unitIndex)
    }

    async function copyUnitImage() {
        await html2canvas(renderUnitsElement, renderingOption).then((renderResult) => {
            renderResult.toBlob(
                (blob) => {
                    if (blob == null) {
                        return
                    }
                    void navigator.clipboard.write([
                        new ClipboardItem({
                            [blob.type]: blob
                        })
                    ])
                },
                "image/png",
                0.7
            )
        })

        imageCopyButtonTextContent = "コピー完了！"
        setTimeout(() => {
            imageCopyButtonTextContent = "画像をコピー"
        }, 2000)
    }

    async function downloadUnitImage() {
        await html2canvas(renderUnitsElement, renderingOption).then((renderResult) => {
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
<section class="page-detail">
    <h2>使い方</h2>
    <p class="sentence">
        フォームに部隊の情報を入力して「画像を出力」ボタンを押すことで部隊編成の画像がダウンロードできます。<br />生徒の情報を追加した後でも右側にあるボタンで編成順の入れ替えや編成の取り消しが可能です。{#if isClipboardAPIAvailable}<br />「画像をコピー」ボタンを押すとクリップボードに部隊編成の画像がコピーされます（一部の環境ではご利用いただけません）。{/if}
    </p>
</section>

<section id="units-container">
    <ol id="units">
        <li>
            {#each units as unit, unitIndex}
                <ol class="unit">
                    <li class="unit-description">
                        <h2>部隊{unitIndex + 1}</h2>
                        <input type="text" placeholder="部隊の説明" bind:value={unit.desc} />
                        {#if unitIndex != 0}
                            <div class="unit-remove-button-container">
                                <RemoveButton onClick={() => removeUnit(unitIndex)} tooltip="部隊を削除" />
                            </div>
                        {/if}
                    </li>
                    {#each STUDENT_ROLE_TYPES as role}
                        {@const studentsNumber = role == "STRIKER" ? 4 : 2}
                        {#each Utils.generateNumberSequence(studentsNumber) as roleIndex}
                            {@const student = role == "STRIKER" ? unit.students.STRIKER[roleIndex - 1] : unit.students.SPECIAL[roleIndex - 1]}
                            {#if student == null}
                                <li class="student-search-field-container">
                                    <div class="student-index-desktop-container">
                                        <span class="student-role" data-student-role={role}>{role}</span><span class="student-index">0{roleIndex}</span>
                                    </div>
                                    <div class="student-index-mobile-container">
                                        <span class="student-role" data-student-role={role} /><span class="student-index">0{roleIndex}</span>
                                    </div>
                                    <div class="student-search-field">
                                        <input type="text" placeholder="生徒を検索" on:input={(event) => search(event, role, generateStudentsNameArray(unit, role), `Unit${unitIndex}-${role}-Student${roleIndex}`)} />
                                        <ul class="search-results">
                                            {#if searchResult != null && currentryFocusedSearchFieldID == `Unit${unitIndex}-${role}-Student${roleIndex}`}
                                                {#each searchResult as result}
                                                    <li class="result">
                                                        <button type="button" on:click={() => (role == "STRIKER" ? (unit.students.STRIKER[roleIndex - 1] = result) : (unit.students.SPECIAL[roleIndex - 1] = result))}>
                                                            <span class="result-name">{result.name}</span>
                                                            <span class="param" data-param-id="atkAttr" data-param-value={result.atkAttr}>{result.atkAttr}</span>
                                                            <span class="param" data-param-id="defAttr" data-param-value={result.defAttr}>{result.defAttr}</span>
                                                        </button>
                                                    </li>
                                                {/each}
                                            {:else}
                                                <p class="no-result-message">検索結果がありません。</p>
                                            {/if}
                                        </ul>
                                    </div>
                                </li>
                            {:else if student != null}
                                <li class="student">
                                    <div class="student-index-desktop-container">
                                        <span class="student-role" data-student-role={role}>{role}</span><span class="student-index">0{roleIndex}</span>
                                    </div>
                                    <div class="student-icon">
                                        <div class="role" data-student-role={role} />
                                        <div class="icon" style="background-image: url(/asset/image/student/icon/{student.name}.webp);" />
                                    </div>
                                    <p class="student-name">{student.name}</p>
                                    <span class="student-params">
                                        {#each STUDENT_PARAMS_DICT as { id, name }}
                                            {@const paramValue = student[id]}
                                            <span class="param" data-param-id={id} data-param-value={paramValue}>{name}{paramValue}</span>
                                        {/each}
                                    </span>
                                    <div class="element-control-buttons">
                                        <!--TODO: 参照だけ渡してコンポーネント化できないか調べる-->
                                        <label class="initial-skill-selector" title="開始スキルとして選択">
                                            <input type="checkbox" name="Unit{unitIndex}-InitialSkills" value={student.name} bind:group={unit.initialSkills} disabled={!unit.initialSkills.some((element) => element == student.name) && unit.initialSkills.length >= 3} />
                                            <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 32 32">
                                                <path d="M7.9 26.7c-.3 0-.6-.2-.8-.4-.2-.2-.3-.6-.3-.9L8 6.6l-1.9.1c-.5 0-.8.4-.8.9l1.2 19.7c0 .5.4.8.9.8l11-.7-10.5-.7z" class="st0" />
                                                <path d="M8.8 25.5c-.3 0-.6-.2-.8-.5-.2-.3-.3-.6-.2-.9L10.6 5l-1.3-.1c-.5 0-.9.3-.9.8L7.1 25.4c0 .5.3.9.8.9l12 .8-11.1-1.6z" class="st0" />
                                                <path d="M26 6 12 3.9c-.5-.1-.9.3-1 .7L8.1 24.2c-.1.5.3.9.7 1l13.9 2.1c.5.1.9-.3 1-.7l3-19.6c.1-.5-.3-1-.7-1zm-3.3 9-6.6 4.5-.6.2h-.3c-.3-.1-.5-.3-.7-.6l-2.3-4.5a1 1 0 0 1 .5-1.4 1 1 0 0 1 1.4.5l1.7 3.4 5.6-3.8c.5-.3 1.2-.2 1.5.3.5.4.3 1.1-.2 1.4z" class="st0" />
                                            </svg>
                                        </label>
                                        <PositionMoveButton
                                            onClick={() => {
                                                swapStudentsIndex(unitIndex, role, roleIndex - 1, "up")
                                            }}
                                            direction="up"
                                            tooltip="上に移動"
                                        />
                                        <PositionMoveButton
                                            onClick={() => {
                                                swapStudentsIndex(unitIndex, role, roleIndex - 1, "down")
                                            }}
                                            direction="down"
                                            tooltip="下に移動"
                                        />
                                        <RemoveButton onClick={() => removeStudentInfo(unitIndex, role, roleIndex - 1)} tooltip="編成を取り消す" />
                                    </div>
                                </li>
                            {/if}
                        {/each}
                    {/each}
                </ol>
            {/each}
            <button id="unit-add-button" type="button" on:click={() => (units = [...units, structuredClone(unitTemplate)])}>部隊を追加</button>
        </li>
    </ol>
    <div id="image-output-buttons">
        {#if isClipboardAPIAvailable}
            <button id="image-copy-button" type="button" on:click={copyUnitImage} disabled={!isClipboardAPIAvailable}>{imageCopyButtonTextContent}</button>
        {/if}
        <button id="image-download-button" type="button" on:click={downloadUnitImage}>ダウンロード</button>
    </div>
</section>

<!--Render target elements-->
<div aria-hidden="true" id="render-units-container" bind:this={renderUnitsElement}>
    <section id="render-units">
        {#each units as unit, unitIndex}
            <section class="render-unit">
                <h2>部隊{unitIndex + 1}{unit.desc ? `（${unit.desc}）` : ""}</h2>
                <section class="render-students">
                    {#each STUDENT_ROLE_TYPES as role}
                        {@const studentsNumber = role == "STRIKER" ? 4 : 2}
                        {#each Utils.generateNumberSequence(studentsNumber) as roleIndex}
                            {@const student = role == "STRIKER" ? unit.students.STRIKER[roleIndex - 1] : unit.students.SPECIAL[roleIndex - 1]}
                            {@const style = student != null ? `background-image: url(/asset/image/student/icon/${student.name}.webp);` : null}
                            {@const isInitialSkillSelected = student != null && unit.initialSkills.some((elements) => elements == student.name)}
                            <section class="render-student" data-is-initial-skill={student != null ? unit.initialSkills.some((elements) => elements == student.name) : "false"}>
                                <div class="render-student-role" data-student-role={role} />
                                <div class="render-student-icon" {style}>
                                    {#if isInitialSkillSelected}
                                        <span class="initial-skill-badge">
                                            <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 32 32">
                                                <path d="M7.9 26.7c-.3 0-.6-.2-.8-.4-.2-.2-.3-.6-.3-.9L8 6.6l-1.9.1c-.5 0-.8.4-.8.9l1.2 19.7c0 .5.4.8.9.8l11-.7-10.5-.7z" class="st0" />
                                                <path d="M8.8 25.5c-.3 0-.6-.2-.8-.5-.2-.3-.3-.6-.2-.9L10.6 5l-1.3-.1c-.5 0-.9.3-.9.8L7.1 25.4c0 .5.3.9.8.9l12 .8-11.1-1.6z" class="st0" />
                                                <path d="M26 6 12 3.9c-.5-.1-.9.3-1 .7L8.1 24.2c-.1.5.3.9.7 1l13.9 2.1c.5.1.9-.3 1-.7l3-19.6c.1-.5-.3-1-.7-1zm-3.3 9-6.6 4.5-.6.2h-.3c-.3-.1-.5-.3-.7-.6l-2.3-4.5a1 1 0 0 1 .5-1.4 1 1 0 0 1 1.4.5l1.7 3.4 5.6-3.8c.5-.3 1.2-.2 1.5.3.5.4.3 1.1-.2 1.4z" class="st0" />
                                            </svg>
                                        </span>
                                    {/if}
                                </div>
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

<style lang="scss">
    $border: solid 0.075rem var(--color-medium-03);

    .page-detail {
        margin: 0.75rem 0;

        h2 {
            margin-bottom: 0.25rem;
        }
    }

    button {
        font: inherit;
        cursor: pointer;

        // TODO: Define as global style
    }

    #units-container {
        width: 100%;
        margin: 0 auto;

        #units {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 2rem 0;

            .unit {
                display: flex;
                flex-direction: column;
                border-top: $border;

                .unit-description {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    padding: 0.75rem 2rem;
                    background-color: var(--color-main-01);

                    h2 {
                        font-weight: 500;
                        white-space: nowrap;
                    }

                    input {
                        box-sizing: border-box;
                        width: 50%;
                        padding: 0.25rem 0.5rem;
                        font-size: 0.925rem;
                        color: var(--color-medium-04);
                        appearance: none;
                        background-color: var(--color-main-01);
                        border: $border;
                        border-radius: 0.25rem;

                        &::placeholder {
                            color: var(--color-medium-04);
                        }
                    }

                    .unit-remove-button-container {
                        height: 1.125rem;
                        margin-left: auto;
                    }

                    @media (max-width: 1280px) {
                        padding: 0.75rem 1.4125rem;

                        input {
                            width: 100%;
                        }
                    }
                }

                .student-search-field-container,
                .student {
                    box-sizing: border-box;
                    width: inherit;
                    padding: 1.4125rem 2rem;
                    background-color: var(--color-main-01);
                    border-top: $border;

                    .student-index-desktop-container {
                        display: flex;
                        gap: 0.5rem;
                        align-items: center;

                        .student-role {
                            font-size: 0.925rem;
                            font-style: oblique;

                            &[data-student-role="STRIKER"] {
                                color: var(--color-student-role-striker);
                            }

                            &[data-student-role="SPECIAL"] {
                                color: var(--color-student-role-special);
                            }
                        }

                        .student-index {
                            font-size: 0.925rem;
                            color: var(--color-medium-04);
                        }

                        @media (max-width: 1280px) {
                            display: none;
                        }
                    }

                    .student-index-mobile-container {
                        display: flex;
                        gap: 0.25rem;
                        align-items: center;

                        .student-role {
                            width: 0.15rem;
                            height: 1.25rem;
                            border-radius: 9999vh;

                            &[data-student-role="STRIKER"] {
                                background-color: var(--color-student-role-striker);
                            }

                            &[data-student-role="SPECIAL"] {
                                background-color: var(--color-student-role-special);
                            }
                        }

                        @media (min-width: 1280px) {
                            display: none;
                        }
                    }

                    @media (max-width: 1280px) {
                        padding: 1.4125rem;
                    }
                }

                .student-search-field-container {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    width: 100%;

                    .student-search-field {
                        position: relative;
                        flex-grow: 1;

                        input {
                            box-sizing: border-box;
                            display: block;
                            width: 100%;
                            padding: 0.25rem 0.5rem;
                            margin: 0 auto;
                            font-size: 0.925rem;
                            color: var(--color-medium-04);
                            appearance: none;
                            background-color: var(--color-main-01);
                            border: $border;
                            border-radius: 0.25rem;

                            &::placeholder {
                                color: var(--color-medium-04);
                            }
                        }

                        .search-results {
                            position: absolute;
                            top: calc(100% + 0.25rem);
                            left: 50%;
                            z-index: 1;
                            box-sizing: border-box;
                            display: none;
                            flex-direction: column;
                            width: 75%;
                            padding: 0.375rem;
                            font-size: 0.925rem;
                            color: var(--color-medium-04);
                            background-color: var(--color-main-01);
                            filter: drop-shadow(0 0.25rem 0.25rem var(--color-medium-02));
                            border: $border;
                            border-radius: 0.25rem;
                            transform: translateX(-50%);

                            .result {
                                button {
                                    display: flex;
                                    gap: 0.625rem;
                                    align-items: center;
                                    width: 100%;
                                    padding: 0.275rem 0.375rem;
                                    font: inherit;
                                    background-color: transparent;
                                    border: none;
                                    border-radius: 0.25rem;
                                    transition-duration: 0.2s;
                                    transition-property: background-color;

                                    &:hover {
                                        background-color: var(--color-medium-02);
                                    }
                                }
                            }

                            @media (max-width: 1280px) {
                                width: 100%;
                            }
                        }

                        input:focus + .search-results,
                        .search-results:hover,
                        .search-results:focus-within {
                            display: flex;
                        }

                        .no-result-message {
                            padding: 0.5rem 0.75rem;
                            color: var(--color-medium-03);
                        }
                    }
                }

                .student {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    padding: 0.75rem 2rem;

                    .student-icon {
                        position: relative;
                        width: 3rem;
                        min-width: 3rem;
                        height: 3rem;
                        min-height: 3rem;
                        margin-right: 0.75rem;

                        .role {
                            position: absolute;
                            width: inherit;
                            height: inherit;
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

                    .student-name {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .student-params {
                        display: flex;
                        gap: 0.5rem;
                        align-items: center;

                        @media (max-width: 1280px) {
                            display: none;
                        }
                    }

                    .element-control-buttons {
                        display: flex;
                        gap: 0.25rem;
                        height: 1.125rem;
                        margin-left: auto;

                        .initial-skill-selector {
                            display: contents;

                            input {
                                display: none;
                            }

                            .st0 {
                                fill: var(--color-medium-02);
                            }

                            input:checked + svg .st0 {
                                fill: var(--color-dominant);
                            }

                            input:disabled + svg .st0 {
                                filter: opacity(0.375);
                            }
                        }

                        @media (max-width: 1280px) {
                            gap: 0.175rem;
                            width: 3.35rem;
                            min-width: 3.35rem;
                            height: 1rem;
                        }
                    }

                    @media (max-width: 1280px) {
                        padding: 0.75rem 1.4125rem;
                    }
                }
            }

            .param {
                padding: 0.175rem 1rem;
                font-size: 0.875rem;
                color: var(--color-white);
                background-color: var(--color-student-param-misc);
                border-radius: 9999vh;

                &[data-param-id="atkAttr"][data-param-value="爆発"],
                &[data-param-id="defAttr"][data-param-value="軽装"] {
                    background-color: var(--color-student-param-red);
                }

                &[data-param-id="atkAttr"][data-param-value="貫通"],
                &[data-param-id="defAttr"][data-param-value="重装"] {
                    background-color: var(--color-student-param-yellow);
                }

                &[data-param-id="atkAttr"][data-param-value="神秘"],
                &[data-param-id="defAttr"][data-param-value="特殊"] {
                    background-color: var(--color-student-param-blue);
                }

                &[data-param-id="atkAttr"][data-param-value="振動"],
                &[data-param-id="defAttr"][data-param-value="弾力"] {
                    background-color: var(--color-student-param-purple);
                }

                &[data-param-id="townApt"],
                &[data-param-id="outdoorApt"],
                &[data-param-id="indoorApt"] {
                    &[data-param-value="S"],
                    &[data-param-value="A"] {
                        background-color: var(--color-student-landscape-apt-green);
                    }

                    &[data-param-value="B"] {
                        background-color: var(--color-student-landscape-apt-yellow);
                    }

                    &[data-param-value="C"],
                    &[data-param-value="D"] {
                        background-color: var(--color-student-landscape-apt-red);
                    }
                }

                @media (max-width: 1280px) {
                    display: none;
                }
            }

            #unit-add-button {
                width: 100%;
                padding: 0.75rem 2rem;
                font-size: 1rem;
                color: var(--color-medium-04);
                background-color: var(--color-main-01);
                border: none;
                border-top: $border;
                border-bottom: $border;
            }
        }

        #image-output-buttons {
            display: flex;
            gap: 1rem;
            justify-content: right;

            #image-copy-button,
            #image-download-button {
                padding: 0.5rem 1rem;
                font-size: 0.875rem;
                border: solid 0.125rem transparent;
                border-radius: 0.25rem;
            }

            #image-copy-button {
                color: var(--color-dominant);
                background-color: var(--color-white);
                border: solid 0.125rem var(--color-dominant);
            }

            #image-download-button {
                color: var(--color-white);
                background-color: var(--color-dominant);
                filter: drop-shadow(0 0 0.125rem var(--color-dominant));
            }
        }
    }

    #render-units-container {
        $base-font-size: 50px;

        position: absolute;
        bottom: 100%;
        box-sizing: border-box;
        width: 1920px;
        padding: calc($base-font-size * 1.75) calc($base-font-size * 2) calc($base-font-size * 0.75);

        #render-units {
            display: flex;
            flex-direction: column;
            gap: calc($base-font-size * 1.5);
            font-size: $base-font-size; // NOTE:  デバイス間でのレイアウトを維持するため、以下の要素では"em"を使う

            .render-unit {
                position: relative;
                padding: 0.75em 1.25em;
                background-color: var(--color-white);
                border: var(--solid-shadow-block-border);

                h2 {
                    padding: 0 0.5em 0.75em;
                    font-size: inherit;
                    font-weight: 500;
                    color: var(--color-black);
                    border-bottom: dashed 0.075em var(--color-medium-04);
                }

                .render-students {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.75em 0.5em;
                    padding-bottom: 0;

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
                            position: relative;
                            min-width: 3.25em;
                            min-height: 3.25em;
                            margin-left: 0.425em;
                            background-color: var(--color-medium-02);
                            background-position: center top;
                            background-size: cover;
                            border-radius: 0.35em;

                            .initial-skill-badge {
                                position: absolute;
                                top: 0.075em;
                                right: 0.075em;
                                width: 1.375em;
                                height: 1.375em;

                                .st0 {
                                    fill: #ffe100;
                                }
                            }
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
            display: flex;
            flex-wrap: nowrap;
            gap: 1em;
            align-items: center;
            justify-content: right;
            margin-top: 1em;
            transform: translateX(0.575em);

            p {
                font-size: 1.25em;
                color: var(--color-medium-03);
            }

            #logo {
                width: 14em;
            }
        }
    }
</style>
