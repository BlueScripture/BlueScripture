import { error } from "@sveltejs/kit"
import Students from "$lib/datas/studentList.json"

/** @type {import('./$types').PageServerLoad} */
export function load({ params }) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const name = params.name as string
    const studentInfo = Students.find((student) => student.name == name)

    if (studentInfo == null) {
        throw error(404, "Not found")
    } else {
        return {
            studentInfo: studentInfo
        }
    }
}
