<script lang="ts">
    import { onMount } from "svelte"
    import PageTitleList from "$lib/datas/pageTitleList.json"
    import { Utils } from "$lib/utils"
    import type { BirthdaySchedule, CommitLog } from "$lib/types"

    type CalendarStruct = {
        today: number
        currentMonth: number
        offset: number
        requiredWeekCount: number
        daysSequence: {
            previousMonth: number[]
            currentMonth: number[]
            nextMonth: number[]
        }
        combinedDaysSequence: number[]
        birthdaysDict: BirthdaySchedule[][]
    }

    export let data: {
        commitLogs: CommitLog[]
        calendarStruct: CalendarStruct
    }

    let mobileCalendarTodayElement: HTMLSpanElement

    function init() {
        const parentLIElement = mobileCalendarTodayElement.parentElement as HTMLLIElement
        ;(parentLIElement.parentElement as HTMLOListElement).scrollTop = parentLIElement.offsetTop - 72
    }

    onMount(() => {
        init()
    })
</script>

<svelte:head>
    <meta name="description" content="BlueScriptureはYostar&NEXON Gamesによる学園×青春×物語RPGアプリ「ブルーアーカイブ（ブルアカ）」のデータを収集・分類・構造化することを目的とした非公式プロジェクトです。" />
</svelte:head>

<h1>BlueScriptureへようこそ、先生！</h1>
<p class="sentence">BlueScriptureはYostar&NEXON Gamesによる学園×青春×物語RPGアプリ<b>「ブルーアーカイブ（ブルアカ）」</b>のデータを収集・分類・構造化することを目的とした非公式プロジェクトです。</p>

<section id="site-map" class="list ruled-line-list solid-shadow-block">
    <h2>サイトマップ</h2>
    <ul>
        {#each PageTitleList as pageTitle}
            {#if pageTitle.level < 2}
                <li>
                    <a class="hover-underline" href="/{pageTitle.path}">{pageTitle.title}</a>
                    <span>/{pageTitle.path}</span>
                </li>
            {/if}
        {/each}
    </ul>
</section>

<h2>アクセス解析について</h2>
<p class="sentence">BlueScriptureでは機能の追加や改善の参考にするため、<a href="//plausible.io" target="_blank">Plausible</a>というツールで皆さんのページ閲覧の傾向を記録しています。<br />Plausibleはプライバシーに配慮したツールであり、個人を特定できるデータを収集することはありません。<br />Plausibleがデータを収集する方法についての詳細は<a href="//plausible.io/privacy-focused-web-analytics" target="_blank">Plausibleの公式サイト（英語）</a>をご覧ください。</p>

<section id="birthday-calendar-desktop" class="list solid-shadow-block">
    <h2>{data.calendarStruct.currentMonth}月のカレンダー</h2>
    <div class="calendar-root">
        <ol class="day-of-week">
            {#each ["日", "月", "火", "水", "木", "金", "土"] as dayOfWeek}
                <li>
                    <span>{dayOfWeek}</span>
                </li>
            {/each}
        </ol>
        <div class="calendar-body">
            {#each Utils.generateNumberSequence(data.calendarStruct.requiredWeekCount) as week}
                {@const offset = (week - 1) * 7}
                <div class="week-container">
                    <ol class="week">
                        {#each data.calendarStruct.combinedDaysSequence.slice(offset, offset + 7) as day, dayOfWeek}
                            <!--NOTE: "index" is current position in combinedDaysSequence-->
                            {@const index = offset + dayOfWeek + 1}
                            <li>
                                <span class="day-number">{day}</span>
                                {#if data.calendarStruct.birthdaysDict[index - 1]}
                                    <span class="birthdays">
                                        {#each data.calendarStruct.birthdaysDict[index - 1] as birthday}
                                            <a href="/students/{birthday.student}" class="birthday">
                                                {birthday.student}の誕生日
                                            </a>
                                        {/each}
                                    </span>
                                {/if}
                            </li>
                        {/each}
                    </ol>
                </div>
            {/each}
        </div>
    </div>
</section>
<section id="birthday-calendar-mobile" class="list solid-shadow-block">
    <h2>{data.calendarStruct.currentMonth}月のカレンダー</h2>
    <ol>
        {#each data.calendarStruct.daysSequence.currentMonth as day, i}
            <li data-is-today={String(day == data.calendarStruct.today)}>
                {#if day == data.calendarStruct.today}
                    <span class="day-number" bind:this={mobileCalendarTodayElement}>{day}</span>
                {:else}
                    <span class="day-number">{day}</span>
                {/if}
                {#if data.calendarStruct.birthdaysDict[i + data.calendarStruct.offset]}
                    <span class="birthdays">
                        {#each data.calendarStruct.birthdaysDict[i + data.calendarStruct.offset] as birthday}
                            <a href="/students/{birthday.student}" class="birthday">
                                {birthday.student}の誕生日
                            </a>
                        {/each}
                    </span>
                {/if}
            </li>
        {/each}
    </ol>
</section>

{#if data.commitLogs != null}
    <section id="commit-logs" class="list ruled-line-list solid-shadow-block">
        <h2>更新履歴</h2>
        {#key data.commitLogs}
            <ul>
                {#each data.commitLogs as commit}
                    <li>
                        <a class="hover-underline" target="_blank" href={commit.url}>{commit.message}</a>
                        <span>{commit.date}</span>
                    </li>
                {/each}
            </ul>
        {/key}
    </section>
{/if}

<style lang="scss">
    h2 {
        margin-bottom: 0.575rem;
    }

    b {
        font-weight: bold;
    }

    // NOTE: Somehow the same snippet in global.scss does not work
    .sentence {
        a {
            text-decoration: underline;
        }
    }

    .list {
        margin: 2.5rem 0 3.5rem;

        h2 {
            margin: 0;
            font-size: 1.5rem;
        }
    }

    .solid-shadow-block {
        position: relative;
        padding: 1rem 1rem 1.25rem;
        background-image: var(--solid-shadow-block-background);
        border: var(--solid-shadow-block-border);

        h2 {
            padding-bottom: 1rem;
            font-size: 1.25rem;
            font-weight: 600;
            text-align: center;
            border-bottom: solid 0.075rem var(--color-medium-04);
        }

        &::after {
            position: absolute;
            top: 0.65rem;
            left: 0.65rem;
            z-index: -1;
            width: 100%;
            height: 100%;
            content: "";
            background-color: var(--color-dominant);
            border: inherit;
        }
    }

    .ruled-line-list {
        ul {
            list-style: none;
        }

        li {
            display: flex;
            align-items: center;
            padding: 0.5rem 0.425rem;
            border-bottom: dashed 0.075rem var(--color-medium-04);
        }
    }

    #site-map,
    #commit-logs {
        li {
            justify-content: space-between;

            span {
                font-size: 0.925rem;
                font-feature-settings: "tnum";
                color: var(--color-medium-04);
            }
        }
    }

    #commit-logs {
        @media (max-width: 720px) {
            li {
                flex-direction: column;
                align-items: unset;

                span {
                    display: none;
                }
            }
        }
    }

    #birthday-calendar-desktop {
        .calendar-root {
            --border: solid 0.075rem var(--color-medium-03);

            .day-of-week {
                display: flex;
                justify-content: space-around;
                padding: 0.5rem 0;
                border-bottom: var(--border);

                li {
                    position: relative;
                    flex-grow: 1;
                    height: 1rem;

                    span {
                        position: absolute;
                        width: 100%;
                        text-align: center;
                    }

                    &:first-of-type {
                        color: var(--color-calendar-red);
                    }

                    &:last-of-type {
                        color: var(--color-calendar-blue);
                    }

                    &:not(:first-of-type) {
                        border-left: var(--border);
                    }
                }
            }

            .calendar-body {
                .week-container {
                    position: relative;
                    height: 5rem;
                    padding: 0.5rem 0;
                    border-bottom: var(--border);

                    .week {
                        display: flex;
                        justify-content: space-around;
                        height: 100%;

                        li {
                            position: relative;
                            flex-grow: 1;

                            .day-number,
                            .birthdays {
                                box-sizing: border-box;
                                padding: 0 0.525rem;
                                line-height: 1.125rem;
                            }

                            .day-number {
                                position: absolute;
                                width: 100%;
                                font-size: 0.875rem;
                                font-feature-settings: "tnum";
                            }

                            .birthdays {
                                position: absolute;
                                display: flex;
                                flex-direction: column;
                                gap: 0.225rem;
                                width: 100%;
                                margin-top: 1.175rem;

                                .birthday {
                                    box-sizing: border-box;
                                    width: 100%;
                                    padding: 0 0.325rem;
                                    overflow: hidden;
                                    font: inherit;
                                    font-size: 0.825rem;
                                    color: var(--color-white);
                                    text-overflow: ellipsis;
                                    white-space: nowrap;
                                    appearance: none;
                                    background-color: var(--color-calendar-pink);
                                    border: none;
                                    border-radius: 0.15rem;
                                }
                            }

                            &:first-of-type {
                                color: var(--color-calendar-red);
                            }

                            &:last-of-type {
                                color: var(--color-calendar-blue);
                            }

                            &:not(:first-of-type) {
                                border-left: var(--border);
                            }
                        }
                    }

                    &:last-of-type {
                        padding-bottom: 0;
                        border-bottom: none;
                    }
                }
            }
        }

        @media (max-width: 720px) {
            display: none;
        }
    }

    #birthday-calendar-mobile {
        ol {
            height: 20rem;
            margin-top: 1rem;
            overflow-y: scroll;
            overscroll-behavior: contain;
            scroll-behavior: smooth;

            li {
                display: flex;
                padding: 0.5rem 0.425rem;
                border-top: dashed 0.075rem var(--color-medium-04);

                .day-number {
                    font-feature-settings: "tnum";
                }

                .birthdays {
                    display: flex;
                    flex-direction: column;
                    gap: 0.425rem;
                    width: 100%;
                    margin-left: 0.425rem;
                    overflow-x: hidden;

                    .birthday {
                        box-sizing: border-box;
                        padding: 0 0.5rem;
                        overflow: hidden;
                        font: inherit;
                        font-size: 0.85rem;
                        line-height: 1.125rem;
                        color: var(--color-white);
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        appearance: none;
                        background-color: var(--color-calendar-pink);
                        border: none;
                        border-radius: 0.15rem;
                    }
                }

                &:first-of-type {
                    border-top: none;
                }

                &[data-is-today="true"] {
                    background-image: linear-gradient(to right, #1be48d 0%, #1be48d 0.225rem, #1be48d8f 0.225rem, transparent);
                }
            }
        }

        @media (min-width: 721px) {
            display: none;
        }
    }
</style>
