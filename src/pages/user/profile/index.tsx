import { useSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { connectToMongoDB } from "@/lib/db";
import { ISurveyDocument } from "../../../../models/surveyModel";
import { BsPencilSquare, BsCalendarDate } from "react-icons/bs";
import { useState, useRef } from "react";
import { MdEdit, MdError, MdOutlineMail, MdPhoneAndroid } from "react-icons/md";
import { RiVerifiedBadgeFill, RiUserFill } from "react-icons/ri";
import { FaGraduationCap } from "react-icons/fa6";
import { FaRegChartBar } from "react-icons/fa";
import { GiDiploma } from "react-icons/gi";
import { Dropdown, DropdownItem, DropdownTrigger, DropdownMenu, Button, Textarea, Input } from "@nextui-org/react";
import mongoose from "mongoose";
import SurveyAnalytics from "../../../../models/surveyAnalytics";
import Survey from "../../../../models/surveyModel";
import User from "../../../../models/userModel";
import Link from "next/link";

interface IUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    birthday?: string;
    course?: string;
    graduationYear?: string;
    description?: string;
    image?: {
        data: string | Buffer;
        contentType: string;
    } | null;
}

interface UserProfileProps {
    surveys: ISurveyDocument[];
    user: IUser;
}

export default function UserProfile({ surveys, user }: UserProfileProps) {
    const { data: session } = useSession();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [userState, setUserState] = useState<IUser>(user);
    const [selectedImage, setSelectedImage] = useState<string | null>(
        user?.image?.data
            ? `data:${user.image.contentType};base64,${user.image.data}`
            : null
    );

    const [description, setDescription] = useState<string>(user?.description || "");
    const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
    const [isSavedDescription, setIsSavedDescription] = useState<boolean | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const toggleEditDescription = () => {
        setIsEditingDescription((prev) => !prev);
        setIsSavedDescription(null);
        if (isEditingDescription) {
            // Reseta a descrição para o valor original ao cancelar
            setDescription(user?.description || "");
        }
    };

    const handleSubmitDescription = async (newDescription: string) => {
        try {
            if (newDescription.length > 500) {
                setErrorMsg('A descrição não pode ultrapassar 500 caracteres');
                setIsSavedDescription(false);
                setTimeout(() => setIsSavedDescription(null), 3000);
                return;
            }

            const res = await fetch(`/api/user/${session?.user?._id}/description`, {
                method: "PATCH",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: newDescription }),
            });

            if (!res.ok) throw new Error((await res.json()).message);

            setIsSavedDescription(true);
            setIsEditingDescription(false);
            setUserState((prev: any) => ({ ...prev, description: newDescription }));
        } catch (err) {
            console.error(err);
            setErrorMsg('Erro ao salvar descrição.');
            setIsSavedDescription(false);
        } finally {
            setTimeout(() => setIsSavedDescription(null), 3000);
        }
    };

    const handleSubmitData = async () => {
        let errors = [];
        if (!name) errors.push("Nome");
        if (!email) errors.push("E-mail");
        if (!course) errors.push("Curso de Formação");
        if (!graduationYear || graduationYear.length < 4 || graduationYear === "0000") {
            errors.push("Ano de Conclusão do Curso válido");
        }
        if (errors.length) {
            setErrorMsg(`${errors.join(", ")} ${errors.length > 1 ? "são" : "é"} obrigatório(s)`);
            setIsSaved(false);
            setTimeout(() => setIsSaved(null), 3000);
            return;
        }
        setIsEditingData(false);
        try {
            const payload: any = {
                name,
                email,
                phone,
                birthday,
                course,
                graduationYear: graduationYear ? parseInt(graduationYear, 10) : null // Converter para número
            };

            const res = await fetch(`/api/user/${session?.user?._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error((await res.json()).message);
            setIsSaved(true);
            setUserState((prev: any) => ({ ...prev, name, email, phone, birthday, course, graduationYear }));
        } catch (err) {
            console.error(err);
            setErrorMsg("Erro ao salvar alterações.");
            setIsSaved(false);
        } finally {
            setTimeout(() => setIsSaved(null), 3000);
        }
    };

    const [isSaved, setIsSaved] = useState<boolean | null>(null);
    const [isEditingData, setIsEditingData] = useState<boolean>(false);
    const [name, setName] = useState<string>(user?.name || "");
    const [email, setEmail] = useState<string>(user?.email || "");
    const [phone, setPhone] = useState<string>(user?.phone || "");
    const [birthday, setBirthday] = useState<string>(user?.birthday || "");
    const [course, setCourse] = useState<string>(user?.course || "");
    const [graduationYear, setGraduationYear] = useState<string>(user?.graduationYear || "");

    const toggleEdit = () => {
        setIsSaved(null);
        setIsEditingData((prev: boolean) => !prev);
        if (isEditingData) {
            // Reseta os valores para os dados originais ao cancelar
            setName(user?.name || "");
            setEmail(user?.email || "");
            setPhone(user?.phone || "");
            setBirthday(user?.birthday || "");
            setCourse(user?.course || "");
            setGraduationYear(user?.graduationYear || "");
        }
    };

    const getInitials = () => {
        const parts = userState?.name?.split(' ') || [];
        return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("O tamanho máximo permitido para a imagem é de 5MB.");
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`/api/user/${userState._id}/image`, {
                method: 'PATCH',
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Erro ao salvar a imagem.");
            }

            const { image } = await res.json();
            setSelectedImage(`data:${image.contentType};base64,${image.data}`);
            setUserState((prev) => ({
                ...prev,
                image: {
                    data: image.data,
                    contentType: image.contentType,
                },
            }));
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar a imagem.");
        }
    };

    const handleDeleteImage = async () => {
        try {
            const res = await fetch(`/api/user/${userState._id}/image`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error("Erro ao excluir a imagem.");
            }

            setSelectedImage(null);
            setUserState((prev) => ({
                ...prev,
                image: null,
            }));
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir a imagem.");
        }
    };

    const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 2) v = v.replace(/^(\d{2})(\d)/, '$1/$2');
        if (v.length > 4) v = v.replace(/^(\d{2}\/\d{2})(\d)/, '$1/$2');
        setBirthday(v);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value.replace(/\D/g, ''));
    };

    const handleGraduationYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGraduationYear(e.target.value.replace(/\D/g, ''));
    };

    return (
        <main className="flex flex-col max-w-full lg:max-w-6xl mx-auto gap-6 lg:gap-10 p-4 lg:p-6">
            {/* Cabeçalho com avatar */}
            <header className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8 p-6 lg:p-8 bg-zinc-100 rounded-xl lg:rounded-2xl shadow">
                <div className="relative">
                    <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-full bg-zinc-200 overflow-hidden flex items-center justify-center">
                        {selectedImage ? (
                            <img src={selectedImage} alt="Imagem do perfil" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl lg:text-3xl font-semibold text-zinc-600">
                                {getInitials()}
                            </span>
                        )}
                    </div>
                    <Dropdown>
                        <DropdownTrigger>
                            <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow cursor-pointer">
                                <BsPencilSquare />
                            </div>
                        </DropdownTrigger>
                        <DropdownMenu>
                            <DropdownItem key="alterar" onClick={() => fileInputRef.current?.click()}>
                                Alterar Imagem
                            </DropdownItem>
                            <DropdownItem key="deletar" color="danger" onClick={handleDeleteImage}>
                                Deletar Imagem
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageChange}
                    />
                </div>
                <div className="text-center lg:text-left">
                    <h1 className="text-2xl lg:text-3xl font-semibold">Olá, {user?.name.split(' ')[0]}!</h1>
                    <p className="text-gray-600 mt-2 lg:mt-3">
                        Bem-vindo à sua página de perfil. Aqui você pode visualizar e editar suas informações pessoais.
                    </p>
                </div>
            </header>
            {/* Descrição do usuário */}
            <section className="bg-white p-6 lg:p-8 rounded-xl lg:rounded-2xl shadow">
                <div className="flex flex-col gap-4">
                    <Textarea
                        label="Descrição"
                        name="description"
                        type="text"
                        placeholder="Escreva um breve relato sobre sua experiência no curso."
                        value={description}
                        onValueChange={setDescription}
                        isReadOnly={!isEditingDescription}
                        maxLength={500}
                        description={`${description.length}/500 caracteres`}
                    />
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                        {!isEditingDescription ? (
                            <Button
                                onClick={toggleEditDescription}
                                startContent={<MdEdit />}
                                className="bg-slate-950 text-white self-start"
                            >
                                Editar
                            </Button>
                        ) : (
                            <>
                                <Button onClick={toggleEditDescription} color="danger" className="self-start">
                                    Cancelar
                                </Button>
                                <Button onClick={() => handleSubmitDescription(description)} className="bg-green-600 text-white self-start">
                                    Salvar
                                </Button>
                            </>
                        )}
                        {isSavedDescription !== null && (
                            <div
                                className={`flex items-center gap-2 ${isSavedDescription ? 'text-slate-950' : 'text-red-800'
                                    }`}
                            >
                                {isSavedDescription ? <RiVerifiedBadgeFill /> : <MdError />}
                                <span>
                                    {isSavedDescription
                                        ? 'Descrição atualizada com sucesso!'
                                        : `Erro: ${errorMsg}`}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            {/* Dados Pessoais */}
            <section className="bg-white p-6 lg:p-8 rounded-xl lg:rounded-2xl shadow">
                <h2 className="text-xl lg:text-2xl font-semibold mb-6 lg:mb-10">Dados Pessoais</h2>
                <div className="space-y-4 lg:space-y-6">
                    <Input
                        label="Nome Completo"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        isReadOnly={!isEditingData}
                        startContent={<RiUserFill className="text-lg text-default-400 pointer-events-none flex-shrink-0 mr-1" />}
                        isRequired
                        isInvalid={!name.trim()}
                        maxLength={50}
                        errorMessage={!name.trim() && "Campo Obrigatório"}
                    />
                    <Input
                        label="E-mail"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        isReadOnly={!isEditingData}
                        startContent={<MdOutlineMail className="text-lg text-default-400 pointer-events-none flex-shrink-0 mr-1" />}
                        isRequired
                        isInvalid={!email.trim()}
                        maxLength={50}
                        errorMessage={!email.trim() && "Campo Obrigatório"}
                    />
                    <Input
                        label="Telefone"
                        name="phone"
                        value={phone}
                        onChange={handlePhoneChange}
                        isReadOnly={!isEditingData}
                        startContent={<MdPhoneAndroid className="text-lg text-default-400 pointer-events-none flex-shrink-0 mr-1" />}
                        maxLength={11}
                    />
                    <Input
                        label="Data de Nascimento"
                        name="birthday"
                        value={birthday}
                        onChange={handleBirthdayChange}
                        isReadOnly={!isEditingData}
                        placeholder="dd/mm/yyyy"
                        startContent={<BsCalendarDate className="text-lg text-default-400 pointer-events-none flex-shrink-0 mr-1" />}
                        maxLength={10}
                    />
                    <Input
                        label="Curso de Formação"
                        name="course"
                        type="text"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        isReadOnly={!isEditingData}
                        startContent={<FaGraduationCap className="text-lg text-default-400 pointer-events-none flex-shrink-0 mr-1" />}
                        isRequired
                        isInvalid={!course}
                        maxLength={50}
                        placeholder="Ex.: Engenharia de Software"
                        errorMessage={!course && "Campo Obrigatório"}
                    />
                    <Input
                        label="Ano de Conclusão do Curso"
                        name="graduationYear"
                        value={graduationYear}
                        onChange={handleGraduationYearChange}
                        isReadOnly={!isEditingData}
                        startContent={<GiDiploma className="text-lg text-default-400 pointer-events-none flex-shrink-0 mr-1" />}
                        isRequired
                        isInvalid={
                            !graduationYear ||
                            (isEditingData && (graduationYear.length < 4 || graduationYear === "0000"))
                        }
                        maxLength={4}
                        minLength={4}
                        placeholder="Ex.: 2025"
                        errorMessage={
                            !graduationYear
                                ? "Campo Obrigatório"
                                : (graduationYear.length < 4 || graduationYear === "0000") && "Ano Inválido"
                        }
                    />
                </div>
                <div className="mt-6 lg:mt-8 flex flex-col lg:flex-row items-start lg:items-center gap-4">
                    {!isEditingData ? (
                        <Button onClick={toggleEdit} className="bg-slate-950 text-white self-start">
                            <MdEdit /> Editar
                        </Button>
                    ) : (
                        <>
                            <Button color="danger" onClick={toggleEdit} className="self-start">
                                Cancelar
                            </Button>
                            <Button className="bg-green-600 text-white self-start" onClick={handleSubmitData}>
                                Salvar
                            </Button>
                        </>
                    )}
                    {isSaved !== null && (
                        <div className={`flex items-center gap-2 ${isSaved ? 'text-slate-950' : 'text-red-600'}`}>
                            {isSaved ? <RiVerifiedBadgeFill /> : <MdError />}
                            <span>{isSaved ? 'Alterações salvas com sucesso!' : 'Erro ao salvar!'}</span>
                        </div>
                    )}
                </div>
            </section>
            {/* Seção de pesquisas respondidas */}
            <section className="bg-white p-6 lg:p-8 rounded-xl lg:rounded-2xl shadow">
                <h2 className="text-xl lg:text-2xl font-semibold mb-6 lg:mb-10">Pesquisas Respondidas</h2>
                {surveys.length > 0 ? (
                    surveys.map((survey) => (
                        <div
                            key={String(survey._id)}
                            className="flex flex-col lg:flex-row items-start lg:items-center justify-between bg-zinc-100 rounded-lg p-4 shadow-md mb-6 lg:mb-8 transition-transform duration-300 ease-in-out hover:scale-[1.02]"
                        >
                            <div className="flex flex-col gap-4 lg:gap-2 w-full lg:max-w-[85%]">
                                <h3 className="text-base lg:text-lg font-semibold truncate" title={survey.title}>
                                    {survey.title}
                                </h3>
                                <p className="text-sm lg:text-base text-gray-600 truncate" title={survey.description}>
                                    {survey.description}
                                </p>
                            </div>
                            <Link href={`/researches?selectedSurvey=${survey._id}`} target="_blank" rel="noopener noreferrer">
                                <Button className="bg-slate-950 text-white px-3 lg:px-5 py-2 lg:py-3 text-sm lg:text-sm mt-4 lg:mt-0 focus:ring-0 focus:outline-none" size="sm">
                                    <FaRegChartBar />Visualizar
                                </Button>
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4 opacity-0 animate-fade-in">
                        <p className="text-gray-500">Você ainda não participou de nenhuma pesquisa pública.</p>
                    </div>
                )}
            </section>

            <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out forwards;
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02); /* Ajustei o zoom */
        }
      `}</style>
        </main>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    await connectToMongoDB();
    const session = await getSession(context);

    if (!session?.user?.email) {
        return { props: { surveys: [], user: null } };
    }

    // Busca o usuário com campos da imagem
    const user = await User.findOne({ email: session.user.email })
        .select('+image.data +image.contentType')
        .lean();

    if (!user?.cpf) {
        return { props: { surveys: [], user: null } };
    }

    // Processa imagem para serialização
    const processedUser = user
        ? {
            ...user,
            image: user.image
                ? {
                    contentType: user.image.contentType,
                    data: user.image.data.toString('base64'),
                }
                : null,
        }
        : null;

    // Busca pesquisas públicas
    const publicAnalytics = await SurveyAnalytics.find({ hasPublic: true }).lean();
    const publicSurveyIds = publicAnalytics
        .map((a: { surveyId: mongoose.Types.ObjectId }) => {
            try {
                return new mongoose.Types.ObjectId(a.surveyId.toString());
            } catch {
                return null;
            }
        })
        .filter(Boolean);

    const surveys = await Survey.find({
        _id: { $in: publicSurveyIds },
        cpf: user.cpf
    }).lean();

    return {
        props: {
            surveys: JSON.parse(JSON.stringify(surveys)),
            user: JSON.parse(
                JSON.stringify({
                    ...processedUser,
                    _id: processedUser?._id ? processedUser._id.toString() : null,
                })
            ),
        },
    };
};

UserProfile.auth = {
    role: 'user',
    unauthorized: '/',
};