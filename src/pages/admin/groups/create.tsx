import CreateManage from "@/components/Groups/CreateManage";


export default function Create() {
    return (
        <CreateManage />
    )
}

Create.auth = {
    role: 'admin',
    verified: true,
    unauthorized: '/'
}