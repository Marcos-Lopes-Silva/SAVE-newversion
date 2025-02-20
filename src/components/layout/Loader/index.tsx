import { useEffect } from "react"
import { Spinner } from "@nextui-org/react";

export function Loader() {
    return (
        <div className="h-full">
            <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0, 0, 0, 0.5)] flex justify-center items-center z-[9999]">
                <div className="bg=[#ffffff] p-20 rounded-2xl text-center items-center justify-center flex flex-col">
                    <Spinner />
                </div>
            </div>
        </div>
    )
}

