import { Form } from '@/components/Form';
import Button from '@/components/layout/Button';
import { t } from 'i18next';
import React, { useState, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Papa from 'papaparse';
import { FaRegFileAlt } from 'react-icons/fa';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: File | null;
    progress: number;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onImportData: (data: any[]) => void;
}

interface FormValues {
    csvUpload: File | null;
}

export const ImportModal: React.FC<ModalProps> = ({ isOpen, onClose, file, progress, onFileChange, onImportData }) => {
    const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploading, setUploading] = useState<boolean>(false);

    const csvUploadForm = useForm<FormValues>({
        defaultValues: {
            csvUpload: null
        }
    });

    if (!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        setUploadProgress(0); 
    };

    const simulateUpload = () => {
        if (!selectedFile) return;

        setUploading(true);
        const totalProgress = 100;
        const intervalTime = 400; 
        let currentProgress = 0;

        const interval = setInterval(() => {
            currentProgress += 10;
            setUploadProgress(currentProgress);

            if (currentProgress >= totalProgress) {
                clearInterval(interval);
                setUploading(false);
                
                Papa.parse(selectedFile, {
                    header: true,
                    complete: (results) => {
                        setParsedData(results.data);
                        onImportData(results.data);
                    },
                });
            }
        }, intervalTime);
    };

    const openSecondModal = () => setIsSecondModalOpen(true);
    const closeSecondModal = () => setIsSecondModalOpen(false);

    return (
    <>
        <div className="fixed z-40 inset-0 font-bold flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl px-10 py-12">
                <h1 className="text-2xl font-bold mb-4">{t('admin.create.second_section.import_participants')}</h1>
                <h1 className="text-black mb-2 text-lg font-bold">{t('admin.create.modal.import_participants_csv')}</h1>
                <h1 className="text-black mb-4 text-small font-bold">
                    {t('admin.create.modal.description')}
                    <Button 
                        variant='tertiary' 
                        className='px-1 text-blue-700'
                        onClick={openSecondModal}
                    >
                        {t('admin.create.modal.description_here')}
                    </Button>
                </h1>
                <FormProvider {...csvUploadForm}>
                    <form>
                        <div>
                            <Form.Label 
                                htmlFor="csvUpload" 
                                className="cursor-pointer text-black border-2 border-dashed border-black bg-zinc-300 rounded-md p-10 text-center justify-center flex flex-col items-center mb-4">
                                <FaRegFileAlt className='size-12 mb-4'/>
                                    {t('admin.create.modal.add_file')}
                                <Form.Input 
                                    id="csvUpload" 
                                    type="file" 
                                    name='csvUpload'
                                    className='hidden'
                                    onChange={handleFileUpload}
                                />
                            </Form.Label>
                        </div>
                    </form>
                </FormProvider>
                {selectedFile && (
                    <div className="mb-4">
                        <p>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                        <div className="pt-1">
                            <div className="mb-2 items-center justify-between">
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-gray-600">
                                    {uploadProgress}%
                                </span>
                            </div>
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                                <div
                                    style={{ width: `${uploadProgress}%` }}
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"/>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-2">
                    <Button onClick={onClose}>
                        {t('admin.create.modal.cancel')}
                    </Button>
                    <Button disabled={!selectedFile || uploading} onClick={simulateUpload}>
                        {uploading ? t('admin.create.modal.uploading') : t('admin.create.modal.import')}
                    </Button>
                </div>
            </div>
        </div>

        {isSecondModalOpen && (
            <div className="fixed z-50 inset-0 font-bold flex items-center justify-center bg-gray-900 bg-opacity-50">
                <div className="bg-white border-2 border-zinc-800 rounded-lg shadow-lg w-full max-w-3xl px-10 py-8">
                    <div className='flex justify-between text-2xl mb-4'>
                        <h1 className="font-bold mt-2">{t('admin.create.second_modal.title')}</h1>
                        <div className="flex justify-end space-x-2">
                            <Button variant='tertiary' onClick={closeSecondModal}>
                                X
                            </Button>
                        </div>
                    </div>
                    <p className='mb-2'>{t('admin.create.second_modal.description')}</p>
                    <p>{t('admin.create.second_modal.description_1')}</p>
                    <p>{t('admin.create.second_modal.description_2')}</p>
                    <h1 className='mb-4 mt-4'>{t('admin.create.second_modal.example')}</h1>
                    <p>{t('admin.create.second_modal.example_1')}</p>
                    <p>{t('admin.create.second_modal.example_2')}</p>
                    <p>{t('admin.create.second_modal.example_3')}</p>
                </div>
            </div>
        )}
    </>
    );
};
