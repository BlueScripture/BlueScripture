import { siteDomain } from "$lib/site.config"
import Students from "$lib/datas/studentList.json"
import Areas from "$lib/datas/stageList.json"
import Items from "$lib/datas/itemList.json"

export function GET() {
    const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>'

    const studentPaths = Students.map((student) => `/students/${student.name}`)
    const stagePaths = Areas.map((area) => area.stages.map((stage) => `/stages/${stage.stageID}`)).flat()
    const itemPaths = Items.map((item) => `/items/${item.name}`)
    const paths = [...studentPaths, ...stagePaths, ...itemPaths]

    const urlset = paths.map((path) => `<url><loc>https://${siteDomain}${path}</loc></url>`).join("\n")
    const xml = `${XML_HEADER}\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>`

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml"
        }
    })
}
