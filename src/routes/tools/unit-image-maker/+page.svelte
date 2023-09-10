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

    const renderingOption = {
        scale: 1,
        width: 1080
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

        units[unitIndex] = unit
    }

    function removeStudentInfo(unitIndex: number, role: StudentRole, studentIndex: number) {
        const unit = units[unitIndex]
        const students = role == "STRIKER" ? unit.students.striker : unit.students.special
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
                    navigator.clipboard.write([
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
<section class="page-information">
    <h2>使い方</h2>
    <p class="sentence">
        フォームに部隊の情報を入力して「画像を出力」ボタンを押すことで部隊編成の画像がダウンロードできます。<br />生徒の情報を追加した後でも右側にあるボタンで編成順の入れ替えや編成の取り消しが可能です。{#if isClipboardAPIAvailable}<br />「画像をコピー」ボタンを押すとクリップボードに部隊編成の画像がコピーされます（一部の環境ではご利用いただけません）。{/if}
    </p>
</section>
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
                            {@const style = student != null ? `background-image: url(/asset/image/student/icon/${student.name}.webp);` : null}
                            <section class="render-student">
                                <div class="render-student-role" data-student-role={role} />
                                <div class="render-student-icon" {style} />
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

<section id="units-container">
    <ol id="units">
        <li>
            {#each Utils.generateNumberSequence(units.length) as unitIndex}
                <ol class="unit">
                    <li class="unit-description">
                        <h2>部隊{unitIndex}</h2>
                        <input type="text" placeholder="部隊の説明" bind:value={units[unitIndex - 1].desc} />
                        {#if unitIndex != 1}
                            <div class="unit-remove-button-container">
                                <RemoveButton onClick={() => removeUnit(unitIndex - 1)} tooltip="部隊を削除" />
                            </div>
                        {/if}
                    </li>
                    {#each STUDENT_ROLE_TYPES as role}
                        {@const studentsNumber = role == "STRIKER" ? 4 : 2}
                        {#each Utils.generateNumberSequence(studentsNumber) as roleIndex}
                            {@const student = role == "STRIKER" ? units[unitIndex - 1].students.striker[roleIndex - 1] : units[unitIndex - 1].students.special[roleIndex - 1]}
                            {#if student == null}
                                <li class="student-search-field-container">
                                    <div class="student-index-desktop-container">
                                        <span class="student-role" data-student-role={role}>{role}</span><span class="student-index">0{roleIndex}</span>
                                    </div>
                                    <div class="student-index-mobile-container">
                                        <span class="student-role" data-student-role={role} /><span class="student-index">0{roleIndex}</span>
                                    </div>
                                    <div class="student-search-field">
                                        <input type="text" placeholder="生徒を検索" on:input={(event) => search(event, role, `Unit${unitIndex}-${role}-Student${roleIndex}`)} />
                                        <ul class="search-results">
                                            {#if searchResult != null && currentryFocusedSearchFieldID == `Unit${unitIndex}-${role}-Student${roleIndex}`}
                                                {#each searchResult as result}
                                                    <li class="result">
                                                        <button type="button" on:click={() => (role == "STRIKER" ? (units[unitIndex - 1].students.striker[roleIndex - 1] = result) : (units[unitIndex - 1].students.special[roleIndex - 1] = result))}>
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
                                        <PositionMoveButton
                                            onClick={() => {
                                                swapStudentsIndex(unitIndex - 1, role, roleIndex - 1, "up")
                                            }}
                                            direction="up"
                                            tooltip="上に移動"
                                        />
                                        <PositionMoveButton
                                            onClick={() => {
                                                swapStudentsIndex(unitIndex - 1, role, roleIndex - 1, "down")
                                            }}
                                            direction="down"
                                            tooltip="下に移動"
                                        />
                                        <RemoveButton onClick={() => removeStudentInfo(unitIndex - 1, role, roleIndex - 1)} tooltip="編成を取り消す" />
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

<style lang="scss">
    $border: solid 0.075rem var(--color-medium-03);

    .page-information {
        margin: 0.75rem 0;

        h2 {
            margin-bottom: 0.25rem;
        }
    }

    button {
        cursor: pointer;
        font: inherit;
        // TODO: Define as global style
    }

    #render-units-container {
        $base-font-size: 28px;
        position: absolute;
        bottom: 100%;
        width: 1080px;
        box-sizing: border-box;
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
            margin-top: 1em;
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

    #units-container {
        margin: 0 auto;
        width: 100%;

        #units {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 2rem 0;

            .unit {
                border-top: $border;
                display: flex;
                flex-direction: column;

                .unit-description {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem 2rem;
                    background-color: var(--color-main-01);

                    h2 {
                        font-weight: 500;
                        white-space: nowrap;
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
                    width: inherit;
                    padding: 1.4125rem 2rem;
                    box-sizing: border-box;
                    border-top: $border;
                    background-color: var(--color-main-01);

                    .student-index-desktop-container {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;

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
                            height: 1.25rem;
                            width: 0.15rem;
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
                    align-items: center;
                    width: 100%;
                    gap: 1rem;

                    .student-search-field {
                        flex-grow: 1;
                        position: relative;

                        input {
                            display: block;
                            margin: 0 auto;
                            width: 100%;
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
                    padding: 0.75rem 2rem;
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

                    .student-name {
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .student-params {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;

                        @media (max-width: 1280px) {
                            display: none;
                        }
                    }

                    .element-control-buttons {
                        display: flex;
                        height: 1.125rem;
                        gap: 0.25rem;
                        margin-left: auto;

                        @media (max-width: 1280px) {
                            gap: 0.175rem;
                            height: 1rem;
                            min-width: 3.35rem;
                            width: 3.35rem;
                        }
                    }

                    @media (max-width: 1280px) {
                        padding: 0.75rem 1.4125rem;
                    }
                }
            }

            .param {
                font-size: 0.875rem;
                border-radius: 9999vh;
                padding: 0.175rem 1rem;
                color: var(--color-white);
                background-color: var(--color-student-param-misc);

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
                font-size: 1rem;
                padding: 0.75rem 2rem;
                border: none;
                border-bottom: $border;
                border-top: $border;
                background-color: var(--color-main-01);
                color: var(--color-medium-04);
            }
        }

        #image-output-buttons {
            display: flex;
            justify-content: right;
            gap: 1rem;

            #image-copy-button,
            #image-download-button {
                border: solid 0.125rem transparent;
                font-size: 0.875rem;
                padding: 0.5rem 1rem;
                border-radius: 0.25rem;
            }

            #image-copy-button {
                border: solid 0.125rem var(--color-dominant);
                color: var(--color-dominant);
                background-color: var(--color-white);
            }

            #image-download-button {
                background-color: var(--color-dominant);
                color: var(--color-white);
                filter: drop-shadow(0 0 0.125rem var(--color-dominant));
            }
        }
    }
</style>
