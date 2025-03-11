import { CardBody, Card } from "@nextui-org/react";
import Image from "next/image";

export default function WorkInProgress({
    showGif = true,
    message = "Estamos trabalhando nessa página!",
    apology = "Pedimos desculpas pelo transtorno.",
}) {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <Card className="py-7    px-5">
                <CardBody className="flex flex-col items-center gap-5">
                    {showGif && (
                        <div className="flex justify-center mb-4">
                            <Image
                                src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGh6dnV5NGF6b3QwMzRsMTVkc2M5dzVhcTJndTNhNGd0Znd4OGN4dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LfisNItfC9Lbw7AV4b/giphy.gif"
                                alt="WIP"
                                width={150}
                                height={150}
                                className="rounded-lg"
                            />
                        </div>
                    )}
                    <div className="flex flex-col items-center gap-1.5">
                        <h2 className="text-xl font-semibold text-gray-700">{message}</h2>
                        <p className="text-sm text-gray-500">{apology}</p>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
