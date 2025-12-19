"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Users, Search, Edit, Trash2, Loader2, ShieldAlert, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        church: "",
        city: "",
        role: "participant",
    });
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        fetchUsers();
    }, [searchTerm]);

    const fetchUsers = async () => {
        try {
            const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
            const response = await fetch(`/api/users${query}`);

            if (!response.ok) {
                throw new Error("Falha ao buscar usuários");
            }

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Erro ao carregar usuários");
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir o usuário ${name}? Essa ação não pode ser desfeita.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/users/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Usuário excluído com sucesso");
                fetchUsers();
            } else {
                toast.error("Erro ao excluir usuário");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Erro ao excluir usuário");
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Usuário criado com sucesso!");
                setIsAddDialogOpen(false);
                setNewUser({
                    name: "",
                    email: "",
                    password: "",
                    phone: "",
                    church: "",
                    city: "",
                    role: "participant",
                });
                fetchUsers();
            } else {
                toast.error(data.error || "Erro ao criar usuário");
            }
        } catch (error) {
            console.error("Error creating user:", error);
            toast.error("Erro ao criar usuário");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
                <Navigation />
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
            <Navigation />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciar Usuários</h1>
                        <p className="text-muted-foreground">Master Admin: Visualize e edite qualquer usuário</p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Adicionar Usuário
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handleAddUser}>
                                <DialogHeader>
                                    <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                                    <DialogDescription>
                                        Preencha os dados do novo usuário. Campos com * são obrigatórios.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nome *</Label>
                                        <Input
                                            id="name"
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Senha *</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Telefone</Label>
                                            <Input
                                                id="phone"
                                                value={newUser.phone}
                                                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="role">Função</Label>
                                            <Select
                                                value={newUser.role}
                                                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="participant">Participante</SelectItem>
                                                    <SelectItem value="admin">Administrador</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="church">Igreja</Label>
                                        <Input
                                            id="church"
                                            value={newUser.church}
                                            onChange={(e) => setNewUser({ ...newUser, church: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="city">Cidade</Label>
                                        <Input
                                            id="city"
                                            value={newUser.city}
                                            onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsAddDialogOpen(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Criando...
                                            </>
                                        ) : (
                                            "Criar Usuário"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card className="shadow-md mb-6">
                    <CardContent className="p-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por nome ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Função</TableHead>
                                    <TableHead>Data de Entrada</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name || "Sem nome"}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "admin"
                                                    ? "bg-purple-100 text-purple-800"
                                                    : "bg-accent/20 text-primary"
                                                    }`}
                                            >
                                                {user.role === "admin" ? (
                                                    <ShieldAlert className="w-3 h-3 mr-1" />
                                                ) : null}
                                                {user.role}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Link href={`/admin/users/${user.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600"
                                                onClick={() => deleteUser(user.id, user.name || "Usuário")}
                                                disabled={session?.user?.email === user.email} // Prevent self-delete
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Nenhum usuário encontrado
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
