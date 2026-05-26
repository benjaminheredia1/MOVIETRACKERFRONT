import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  List,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getLists, addList, updateList, deleteList } from "@/services/api";
import { formatDate } from "@/lib/helpers";
import type { Lista } from "@/types";
import { toast } from "sonner";

export default function ListsPage() {
  const [lists, setLists] = useState<Lista[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Lista | null>(null);
  const [deleteItem, setDeleteItem] = useState<Lista | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLists();
      setLists(data || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar listas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    setSubmitting(true);
    try {
      await addList({ name, description });
      toast.success("Lista creada exitosamente");
      setCreateOpen(false);
      setName("");
      setDescription("");
      fetchLists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editItem || !name.trim()) return;
    setSubmitting(true);
    try {
      await updateList(editItem.id, { name, description });
      toast.success("Lista actualizada");
      setEditItem(null);
      setName("");
      setDescription("");
      fetchLists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setSubmitting(true);
    try {
      await deleteList(deleteItem.id);
      toast.success("Lista eliminada");
      setDeleteItem(null);
      fetchLists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (list: Lista) => {
    setName(list.name);
    setDescription(list.description);
    setEditItem(list);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Listas</h1>
          <p className="mt-1 text-muted-foreground">
            Organiza tu contenido en listas personalizadas
          </p>
        </div>
        <Button
          onClick={() => {
            setName("");
            setDescription("");
            setCreateOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Lista
        </Button>
      </div>

      {/* Lists Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : lists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
            <FolderOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No hay listas</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Crea tu primera lista para organizar películas y series
          </p>
          <Button
            onClick={() => setCreateOpen(true)}
            className="mt-4 gap-2"
          >
            <Plus className="h-4 w-4" />
            Crear primera lista
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <Card
              key={list.id}
              className="group relative overflow-hidden border-0 bg-card shadow-sm transition-all hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <List className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{list.name}</CardTitle>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => openEdit(list)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteItem(list)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {list.description || "Sin descripción"}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Creada: {formatDate(list.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nueva lista</DialogTitle>
            <DialogDescription>
              Dale un nombre y descripción a tu nueva lista
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label htmlFor="list-name" className="text-sm font-medium">Nombre</label>
              <Input
                id="list-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mi lista de favoritos"
                className="mt-1.5"
              />
            </div>
            <div>
              <label htmlFor="list-desc" className="text-sm font-medium">Descripción</label>
              <Textarea
                id="list-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción de la lista..."
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar lista</DialogTitle>
            <DialogDescription>Modifica el nombre o descripción</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label htmlFor="edit-name" className="text-sm font-medium">Nombre</label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <label htmlFor="edit-desc" className="text-sm font-medium">Descripción</label>
              <Textarea
                id="edit-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit2 className="h-4 w-4" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        {deleteItem && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar lista</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de eliminar la lista "{deleteItem.name}"? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteItem(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
