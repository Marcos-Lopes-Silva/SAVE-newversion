import { createHash } from "crypto";
import { api } from "./api";
import { IGroupDocument } from "../../models/groupModel";
import { ISurveyUsersDocument } from "../../models/surveyUsersModel";

interface IUsers {
    id: string;
    name: string;
    email: string;
    cpf?: string;
    birthDate?: string;
}

export async function createGroup(users: IUsers[], selectedGroup: string, surveyId: string, author: string) {



    if (selectedGroup != '') {
        setSurveyToGroup(selectedGroup, surveyId);
        return;
    }

    const hash = createHash('sha256');
    const newGroup = {
        firstLetter: 'G',
        name: `Grupo ${hash.update(new Date().toISOString()).digest('hex').slice(0, 6).toString()}`,
        members: users,
        author: author,
        description: 'Grupo de usuários'
    };

    try {
        const group = await api.post<IGroupDocument>(`group`,
            newGroup
        );
        setSurveyToGroup(group._id as string, surveyId);
    } catch (error) {
        console.error(error);
    }
}


async function setSurveyToGroup(groupId: string, surveyId: string) {
    try {
        await api.post<ISurveyUsersDocument>(`user/survey/create`, {
            surveyId: surveyId,
            groupId: groupId,
        });
    } catch (error) {
        console.error(error);
    }

}