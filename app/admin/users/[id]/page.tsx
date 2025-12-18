"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface UserDetails {
    id: string;
    name: string;
    email: string;
    phone?: string;
    church?: string;
    city?: string;
    role: string;
    _count?: {
        readingProgress: number;
        checkIns: number;
    }
}

export default function EditUserPage({ params }: { params: { id: string } }) {
    const [user, setUser] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [church, setChurch] = useState("");
    const [city, setCity] = useState("");
    const [role, setRole] = useState("participant");

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await fetch(`/api/users/${params.id}`);
            if (!response.ok) throw new Error("Usuário não encontrado");

            const data = await response.json();
            setUser(data);
            setName(data.name || "");
            setEmail(data.email || "");
            setPhone(data.phone || "");
            setChurch(data.church || "");
            setCity(data.city || "");
            setRole(data.role || "participant");
        } catch (error) {
            console.error("Error fetching user:", error);
            toast.error("Erro ao carregar usuário");
            router.push("/admin/users");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch(`/api/users/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, phone, church, city, role }),
            });

            if (!response.ok) throw new Error("Erro ao salvar");

            toast.success("Usuário atualizado com sucesso!");
            router.push("/admin/users");
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("Erro ao atualizar usuário");
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
                <Link href="/admin/users" className="flex items-center text-gray-600 hover:text-blue-600 mb-6 w-fit">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para Lista de Usuários
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Editar Usuário</h1>
                    <p className="text-gray-600">Alterar dados e permissões de acesso</p>
                </div>

                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Dados do Perfil</CardTitle>
                        <CardDescription>ID: {user?.id}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nome do usuário"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@exemplo.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(61) 99999-9999"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="church">Nome da Igreja</Label>
                                <Input
                                    id="church"
                                    value={church}
                                    onChange={(e) => setChurch(e.target.value)}
                                    placeholder="Verbo da Vida"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">Cidade</Label>
                                <Input
                                    id="city"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Brasília-DF"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Função (Nível de Acesso)</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a função" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="participant">Participante (Padrão)</SelectItem>
                                        <SelectItem value="admin">Administrador (Master)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500 mt-1">
                                    CUIDADO: Administradores têm acesso total ao sistema.
                                </p>
                            </div>

                            {/* Read-only stats could go here */}
                            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded text-center">
                                    <p className="text-xs text-gray-500 uppercase">Capítulos Lidos</p>
                                    <p className="text-xl font-bold text-blue-600">{user?._count?.readingProgress || 0}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded text-center">
                                    <p className="text-xs text-gray-500 uppercase">Check-ins Feitos</p>
                                    <p className="text-xl font-bold text-green-600">{user?._count?.checkIns || 0}</p>
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
                                            Salvar Alterações
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
