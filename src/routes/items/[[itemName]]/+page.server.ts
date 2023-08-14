import Items from "$lib/datas/itemList.json"

type Params = {
    itemName: string | undefined
}

/** @type {import('./$types').PageServerLoad} */
export function load({ params }) {
    if ((params as Params).itemName == null) {
        return null
    }

    const name = (params as Params).itemName as string
    const itemInfo = Items.find((item) => item.name == name)

    if (itemInfo == null) {
        return null
    } else {
        return {
            itemInfo: itemInfo
        }
    }
}
