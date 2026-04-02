import { Form } from '@/components/Form';
import Button from '@/components/layout/Button';
import { api } from '@/lib/api';
import access from '@/static/images/access.svg';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { z } from 'zod';

const createRequestSchema = z.object({
    name: z.string().min(6),
    institute: z.string().min(3),
    email: z.string().email().min(6),
    phone: z.string().regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/),
});

interface ICreateRequestData {
    subject: string;
    name: string;
    phone: string;
    institute: string;
    email: string;
}

type CreateRequestData = z.infer<typeof createRequestSchema>;

export default function Access() {

    const { t } = useTranslation();

    const createRequestForm = useForm<CreateRequestData>({
        resolver: zodResolver(createRequestSchema),
    });

    const requestAccess = async (data: CreateRequestData) => {
        try {
            api.post<ICreateRequestData>('/mailer', {
                subject: 'Nova solicitação de acesso',
                name: data.name,
                phone: data.phone,
                institute: data.institute,
                email: data.email,  
            });
        } catch (error) {
            return toast.error(error as string);
        } finally {
            isSubmitSuccessful && createRequestForm.reset();
            toast.success(t('access.success'));
        }
    }

    const {
        handleSubmit,
        formState: { isSubmitting, isSubmitSuccessful },
        watch,
        control,
    } = createRequestForm;


    return (
        <main className="flex min-h-screen p-20 w-full justify-center gap-20">
            <section className="flex flex-col gap-16">
                <h1 className="font-extrabold text-5xl pl-20">SAVE</h1>
                <Image src={access} alt="Access" />
            </section>
            <section className="flex flex-col gap-5">
                <h2 className="font-bold text-2xl">{t('access.request')}</h2>
                <p>{t('access.request_text')}</p>
                <FormProvider {...createRequestForm}>
                    <form
                        className="flex flex-col gap-6"
                        onSubmit={handleSubmit(requestAccess)}
                    >
                        <Form.Field>
                            <Form.Label htmlFor="name">{t('access.label.name')}</Form.Label>
                            <Form.Input name="name" type="name" placeholder={t('access.placeholder.name')} />
                            <Form.ErrorMessage field="name" />
                        </Form.Field>

                        <Form.Field>
                            <Form.Label htmlFor="institute">{t('access.label.institute')}</Form.Label>
                            <Form.Input name="institute" type="institute" placeholder={t('access.placeholder.institute')} />
                            <Form.ErrorMessage field="institute" />
                        </Form.Field>

                        <Form.Field>
                            <Form.Label htmlFor="email">{t('access.label.email')}</Form.Label>
                            <Form.Input type="email" name="email" placeholder={t('access.placeholder.email')} />
                            <Form.ErrorMessage field="email" />
                        </Form.Field>

                        <Form.Field>
                            <Form.Label htmlFor="phone">{t('access.label.phone')}</Form.Label>
                            <Form.MaskedInput mask='(99) 99999-9999' maskChar='' variant='underlined' control={control} name="phone" type="phone" placeholder={t('access.placeholder.phone')} />
                            <Form.ErrorMessage field="phone" />
                        </Form.Field>

                        <Button type='submit'>{t('access.request')}</Button>
                    </form>
                </FormProvider>
            </section>
        </main>
    )
}