<script lang="ts">
    import HeadlineGroup from "$lib/components/HeadlineGroup.svelte"
    import Logo from "$lib/components/Logo.svelte"
    import { Utils } from "$lib/utils"
    import html2canvas from "html2canvas"

    type Unit = {
        desc: string | ""
        students: {
            striker: (string | undefined)[]
            special: (string | undefined)[]
        }
    }

    const units: Unit[] = [
        {
            desc: "",
            students: {
                striker: [],
                special: []
            }
        }
    ]
    let unitsElement: HTMLElement

    const PAGE_DESCRIPTION = "SNS等で共有可能な部隊編成の画像を作成できるツールです。"

    function downloadUnitImage() {
        html2canvas(unitsElement).then((renderResult) => {
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
<div id="units-container" bind:this={unitsElement}>
    <section id="units">
        {#each units as unit}
            <section class="unit">
                <h2>部隊1{unit.desc ? `（${unit.desc}）` : ""}</h2>
                <section class="students">
                    {#each Utils.generateNumberSequence(4) as index}
                        {@const name = unit.students.striker[index - 1]}
                        <section class="student">
                            <div class="student-role" data-student-role="STRIKER" />
                            <div class="student-icon" style={name != null ? `background-image: url(/asset/image/student/icon/${name}.webp);` : null} />
                        </section>
                    {/each}
                    {#each Utils.generateNumberSequence(2) as index}
                        {@const name = unit.students.striker[index - 1]}
                        <section class="student">
                            <div class="student-role" data-student-role="SPECIAL" />
                            <div class="student-icon" style={name != null ? `background-image: url(/asset/image/student/icon/${name}.webp);` : null} />
                        </section>
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
<button type="button" on:click={downloadUnitImage}>Render</button>

<style lang="scss">
    #units-container {
        $base-font-size: 28px;
        //position: absolute;
        bottom: 100%;
        width: 1080px;
        box-sizing: border-box;
        padding: calc($base-font-size * 1.75) calc($base-font-size * 2) calc($base-font-size * 0.75);

        #units {
            display: flex;
            flex-direction: column;
            gap: calc($base-font-size * 1.5);
            font-size: $base-font-size; // デバイス間でのレイアウトを維持するため、以下の要素では"em"を使う

            .unit {
                position: relative;
                padding: 0.75em 1.25em;
                background-color: var(--color-main-01);
                border: var(--solid-shadow-block-border);

                h2 {
                    padding: 0 0.5em 0.75em;
                    font-size: inherit;
                    font-weight: 500;
                    border-bottom: dashed 0.075em var(--color-medium-04);
                }

                .students {
                    padding: 0.75em 0.5em;
                    padding-bottom: 0;
                    display: flex;
                    justify-content: space-between;

                    .student {
                        position: relative;

                        .student-role {
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

                        .student-icon {
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
</style>
