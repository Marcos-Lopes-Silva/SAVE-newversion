import { Loader } from "@/components/layout/Loader";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { IUserDocument } from "../../../models/userModel";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import { api } from "@/lib/api";
import { set } from "mongoose";



export default function Authenticate() {

    const { push } = useRouter();
    const { data: session, status } = useSession();

    async function handleRedirect(role: string) {

        if (session?.user == null || session?.user == undefined) return push('/')

        await promiseHandler(session, role)

        if (role == 'user')
            return push('user/dashboard')

        if (session?.user.role === 'admin' && session?.user.verified)
            return push('admin/dashboard')

        return push('/access')
    }

    useEffect(() => {
        if (typeof window !== 'undefined' && status === 'authenticated') {
            const storedRole = localStorage.getItem('role');
            if (storedRole) {
                handleRedirect(storedRole)
                localStorage.removeItem('role');
            } else {
                handleRedirect(session?.user?.role!!);
            }
        }
    }, [status]);
    return <Loader />
}

const promiseHandler = async (session: Session, role: string) => {


    const u = await api.get<IUserDocument>(`/user/${session?.user.email!!}`);

    if (!u) return null;

    if (u.role === role) return u?.approved ?? false;

    const uUpdated = await api.patch(`/user/${u._id as string}`, { role: role })

    return uUpdated
}
