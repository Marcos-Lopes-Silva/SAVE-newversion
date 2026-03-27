import React, { useState } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Progress
} from "@nextui-org/react";
import { t } from 'i18next';
import Papa from 'papaparse';
import { FaRegFileAlt, FaCloudUploadAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportData: (data: any[]) => void;
}

interface ImportSummary {
    total: number;
    success: number;
    errors: string[];
}

export const ImportModal: React.FC<ModalProps> = ({ isOpen, onClose, onImportData }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [summary, setSummary] = useState<ImportSummary | null>(null);
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        setSummary(null);
    };

    const processCSV = () => {
        if (!selectedFile) return;

        setIsParsing(true);
        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            delimiter: "", // Auto-detect delimiter
            complete: (results) => {
                const data = results.data;
                const errors: string[] = [];
                let successCount = 0;

                const formattedData = data.map((row: any, index: number) => {
                    const normalizedRow: any = {};
                    Object.keys(row).forEach(key => {
                        const lowKey = key.toLowerCase().trim();
                        if (lowKey.includes('nome') || lowKey === 'name') normalizedRow.name = row[key];
                        else if (lowKey.includes('email') || lowKey === 'e-mail') normalizedRow.email = row[key];
                        else if (lowKey.includes('cpf')) normalizedRow.cpf = row[key];
                    });

                    if (!normalizedRow.name || !normalizedRow.email) {
                        errors.push(t('admin.create.modal.error_row', { index: index + 1 }));
                        return null;
                    }

                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedRow.email)) {
                        errors.push(t('admin.create.modal.error_email', { index: index + 1 }));
                        return null;
                    }

                    successCount++;
                    return normalizedRow;
                }).filter(Boolean);

                setSummary({
                    total: data.length,
                    success: successCount,
                    errors: errors
                });

                if (successCount > 0) {
                    onImportData(formattedData);
                }
                setIsParsing(false);
            },
            error: (error) => {
                console.error("CSV Parse Error:", error);
                setIsParsing(false);
                setSummary({
                    total: 0,
                    success: 0,
                    errors: [t('admin.create.modal.parse_error')]
                });
            }
        });
    };

    const resetModal = () => {
        setSelectedFile(null);
        setSummary(null);
        setIsParsing(false);
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    const downloadTemplate = () => {
        const csvContent = "name;email;cpf\nJoão Silva;joao@exemplo.com;123.456.789-00\nMaria Oliveira;maria@exemplo.com;987.654.321-11";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "template_participantes.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                size="2xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1 dark:text-white">
                        {t('admin.create.second_section.import_participants')}
                    </ModalHeader>
                    <ModalBody>
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-zinc-500 dark:text-zinc-300">
                                {t('admin.create.modal.description')}
                                <Button
                                    variant="light"
                                    color="primary"
                                    size="sm"
                                    onClick={() => setIsInstructionsOpen(true)}
                                    className="px-1 min-w-unit-0"
                                >
                                    {t('admin.create.modal.description_here')}
                                </Button>
                            </p>

                            {!summary ? (
                                <div className="flex flex-col gap-4">
                                    <label
                                        htmlFor="csvUpload"
                                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
                                    >
                                        <FaCloudUploadAlt className="text-4xl text-gray-400 mb-2" />
                                        <span className="text-sm font-medium">
                                            {selectedFile ? selectedFile.name : t('admin.create.modal.add_file')}
                                        </span>
                                        {selectedFile && (
                                            <span className="text-xs text-gray-400 mt-1">
                                                {(selectedFile.size / 1024).toFixed(2)} KB
                                            </span>
                                        )}
                                        <input
                                            id="csvUpload"
                                            type="file"
                                            accept=".csv"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                        />
                                    </label>

                                    <Button
                                        variant="flat"
                                        color="default"
                                        startContent={<FaRegFileAlt />}
                                        onClick={downloadTemplate}
                                    >
                                        {t('admin.create.modal.download_template', 'Baixar Template CSV')}
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 p-4 border rounded-xl bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        {summary.success === summary.total ? (
                                            <FaCheckCircle className="text-green-500" />
                                        ) : (
                                            <FaExclamationTriangle className="text-amber-500" />
                                        )}
                                        <h3 className="font-semibold">
                                            {t('admin.create.modal.import_summary', 'Resumo da Importação')}
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-white rounded-lg shadow-sm">
                                            <p className="text-xs text-gray-400 uppercase font-bold">{t('admin.create.modal.total_rows', 'Total de linhas')}</p>
                                            <p className="text-xl font-bold">{summary.total}</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-lg shadow-sm">
                                            <p className="text-xs text-gray-400 uppercase font-bold">{t('admin.create.modal.success_rows', 'Sucesso')}</p>
                                            <p className="text-xl font-bold text-green-600">{summary.success}</p>
                                        </div>
                                    </div>
                                    {summary.errors.length > 0 && (
                                        <div className="mt-2">
                                            <p className="text-sm font-bold text-red-500 mb-1">{t('admin.create.modal.errors', 'Erros encontrados:')}</p>
                                            <ul className="text-xs text-red-400 list-disc pl-4 max-h-32 overflow-y-auto">
                                                {summary.errors.slice(0, 10).map((err, i) => (
                                                    <li key={i}>{err}</li>
                                                ))}
                                                {summary.errors.length > 10 && <li>...e mais {summary.errors.length - 10} erros</li>}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={handleClose}>
                            {t('admin.create.modal.cancel')}
                        </Button>
                        {!summary ? (
                            <Button
                                color="primary"
                                isDisabled={!selectedFile || isParsing}
                                isLoading={isParsing}
                                onPress={processCSV}
                            >
                                {t('admin.create.modal.import')}
                            </Button>
                        ) : (
                            <Button color="primary" onPress={handleClose}>
                                {t('admin.create.modal.finish', 'Concluir')}
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isInstructionsOpen} onClose={() => setIsInstructionsOpen(false)} size="lg">
                <ModalContent>
                    <ModalHeader className='dark:text-white'>{t('admin.create.second_modal.title')}</ModalHeader>
                    <ModalBody>
                        <div className="flex flex-col gap-2">
                            <p className='dark:text-white'>{t('admin.create.second_modal.description')}</p>
                            <ul className="list-disc pl-5 text-sm space-y-1">
                                <li className='dark:text-white'>{t('admin.create.second_modal.description_1')}</li>
                                <li className='dark:text-white'>{t('admin.create.second_modal.description_2')}</li>
                            </ul>
                            <div className="mt-4 p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                                <h4 className="font-bold mb-2 text-sm uppercase text-gray-500 dark:text-white">{t('admin.create.second_modal.example')}</h4>
                                <pre className="text-xs font-mono dark:text-white">
                                    {t('admin.create.second_modal.example_1')}<br />
                                    {t('admin.create.second_modal.example_2')}<br />
                                    {t('admin.create.second_modal.example_3')}
                                </pre>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onPress={() => setIsInstructionsOpen(false)}>OK</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};
