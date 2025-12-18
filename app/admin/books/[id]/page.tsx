"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft, Save, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

export default function EditBookPage({ params }: { params: { id: string } }) {
    const isNew = params.id === "new";
    const router = useRouter();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        author: "",
        totalChapters: "20",
        durationWeeks: "8",
        startDate: format(new Date(), "yyyy-MM-dd"), // HTML date input needs yyyy-MM-dd
        isActive: false
    });

    useEffect(() => {
        if (!isNew) {
            fetchBook();
        }
    }, []);

    const fetchBook = async () => {
        try {
            const response = await fetch(`/api/books/${params.id}`);
            if (!response.ok) throw new Error("Livro não encontrado");

            const data = await response.json();
            setFormData({
                title: data.title,
                author: data.author,
                totalChapters: data.totalChapters.toString(),
                durationWeeks: data.durationWeeks.toString(),
                startDate: format(new Date(data.startDate), "yyyy-MM-dd"),
                isActive: data.isActive
            });
        } catch (error) {
            console.error("Error fetching book:", error);
            toast.error("Erro ao carregar dados do livro");
            router.push("/admin/books");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        // Basic validation
        if (!formData.title || !formData.author || !formData.startDate) {
            toast.error("Preencha todos os campos obrigatórios");
            setSaving(false);
            return;
        }

        try {
            const url = isNew ? "/api/books" : `/api/books/${params.id}`;
            const method = isNew ? "POST" : "PUT";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Erro ao salvar");

            toast.success(isNew ? "Livro criado com sucesso!" : "Livro atualizado com sucesso!");
            router.push("/admin/books");
        } catch (error) {
            console.error("Error saving book:", error);
            toast.error("Erro ao salvar livro");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
                <Navigation />
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            <Navigation />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link href="/admin/books" className="flex items-center text-gray-600 hover:text-blue-600 mb-6 w-fit">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para Lista
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {isNew ? "Novo Livro" : "Editar Livro"}
                    </h1>
                    <p className="text-gray-600">
                        {isNew ? "Adicionar uma nova leitura ao clube" : "Alterar detalhes do livro"}
                    </p>
                </div>

                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Informações do Livro</CardTitle>
                        <CardDescription>Preencha os dados da leitura</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Título do Livro</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Curso de Estudos da Fé Bíblica"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="author">Autor</Label>
                                    <Input
                                        id="author"
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        placeholder="Kenneth E. Hagin"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Data de Início</Label>
                                    <div className="relative">
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="isActive" className="mb-2 block">Status da Leitura</Label>
                                    <div className="flex items-center space-x-2 border p-3 rounded-md">
                                        <Switch
                                            id="isActive"
                                            checked={formData.isActive}
                                            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                        />
                                        <Label htmlFor="isActive" className="cursor-pointer">
                                            {formData.isActive ? "Livro Ativo (Leitura Atual)" : "Livro Inativo"}
                                        </Label>
                                    </div>
                                    {formData.isActive && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            Nota: Ativar este livro irá desativar qualquer outro que esteja ativo.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="totalChapters">Total de Capítulos</Label>
                                    <Input
                                        id="totalChapters"
                                        type="number"
                                        min="1"
                                        value={formData.totalChapters}
                                        onChange={(e) => setFormData({ ...formData, totalChapters: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="durationWeeks">Duração (Semanas)</Label>
                                    <Input
                                        id="durationWeeks"
                                        type="number"
                                        min="1"
                                        value={formData.durationWeeks}
                                        onChange={(e) => setFormData({ ...formData, durationWeeks: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Salvar Livro
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
