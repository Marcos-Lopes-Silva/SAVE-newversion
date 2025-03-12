import { Button } from "@nextui-org/button";
import { IoMdDownload } from "react-icons/io";
import { TbArrowsDiagonal } from "react-icons/tb";
import { PiClockClockwiseFill } from "react-icons/pi";

interface GraphicProps {
    questionTitle: string;
}

export default function Graphic({ questionTitle }: GraphicProps) {
    return (
        <main>
            <div className="bg-slate-950 p-7 mx-auto max-w-4xl mt-28 rounded-t-2xl">
                <div className="flex items-center">
                    <h2 className="text-white">{questionTitle}</h2>
                    <div className="flex items-center gap-5 ml-auto">
                        <div className="flex gap-2 border-2 rounded-xl border-white p-2 text-white text-sm">
                            <PiClockClockwiseFill style={{ fontSize: '1.5em' }} />
                            <p>Ultima atualização</p>
                        </div>
                        <Button variant="bordered" style={{ borderColor: 'white', paddingRight: '10px', paddingLeft: '10px', height: '36px' }}>
                            <IoMdDownload style={{ color: 'white', fontSize: '1.5em' }} />
                        </Button>
                    </div>
                </div>

            </div>
            <div className="shadow-lg rounded-2xl bg-white p-52 mx-auto max-w-4xl">
                {/* <div className="">
                    <Button variant="solid" style={{ backgroundColor: 'black', height: '36px',}}>
                    <TbArrowsDiagonal style={{ color: 'white', fontSize: '2em' }} /> </Button>
                </div> */}
            </div>
        </main>
    );
}