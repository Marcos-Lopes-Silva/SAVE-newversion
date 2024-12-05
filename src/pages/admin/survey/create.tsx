import Manage from "@/components/Survey/Manage";

export default function Create() {
    return <Manage />
}


Create.auth = {
    role: 'admin',
    verified: true,
    unauthorized: '/'
}