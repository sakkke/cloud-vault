'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Folder, File, Plus, MoreVertical, Home, Star, Trash, Upload, Download } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { User } from '@supabase/supabase-js'

const supabase = createClient()

// Itemインターフェースの定義
interface Item {
  id: string;
  name: string;
  type: 'file' | 'folder';
  last_modified: string;
  view: string;
  file_path?: string;
  user_id: string;
}

export function IndexPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentView, setCurrentView] = useState('myDrive')
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<Item[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async (view: string, userId: string) => {
    setIsLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('view', view)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error fetching items:', error)
      setError('アイテムの取得中にエラーが発生しました。')
    } else {
      setItems(data as Item[] || [])
    }
    setIsLoading(false)
  }, []) // 依存配列を空にする

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        fetchItems(currentView, user.id)
      } else {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, []) // 初回レンダリング時のみ実行

  useEffect(() => {
    if (user) {
      fetchItems(currentView, user.id)
    }
  }, [currentView, user, fetchItems]) // fetchItems を依存配列に追加

  const handleCreateNewItem = async () => {
    if (!user) return

    const newItem: Omit<Item, 'id'> = {
      name: newItemName,
      type: newItemType as 'file' | 'folder',
      last_modified: new Date().toISOString(),
      view: currentView,
      user_id: user.id
    }

    const { data, error } = await supabase
      .from('items')
      .insert([newItem])
      .select()

    if (error) {
      console.error('Error creating new item:', error)
    } else {
      setItems([...items, data[0] as Item])
    }

    setIsNewItemDialogOpen(false)
    setNewItemName('')
    setNewItemType('file')
  }

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!user || !files) return

    for (const file of Array.from(files)) {
      const filePath = `${user.id}/${currentView}/${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file)

      if (uploadError) {
        console.error('ファイルのアップロードエラー:', uploadError)
      } else {
        const newItem: Omit<Item, 'id'> = {
          name: file.name,
          type: 'file',
          last_modified: new Date().toISOString(),
          view: currentView,
          file_path: uploadData.path,
          user_id: user.id
        }

        const { data: insertData, error: insertError } = await supabase
          .from('items')
          .insert([newItem])
          .select()

        if (insertError) {
          console.error('ファイルレコードの挿入エラー:', insertError)
        } else if (insertData && insertData.length > 0) {
          const insertedItem = insertData[0] as Item
          setItems(prevItems => [...prevItems, insertedItem])
          console.log('挿入されたアイテムのID:', insertedItem.id)
        }
      }
    }
  }, [user, currentView])

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }, [])

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
    const files = event.dataTransfer.files
    handleFileUpload(files)
  }, [handleFileUpload])

  const handleDownload = useCallback(async (item: Item) => {
    if (item.type !== 'file' || !item.file_path) return

    const { data, error } = await supabase.storage
      .from('files')
      .download(item.file_path)

    if (error) {
      console.error('ファイルのダウンロードエラー:', error)
    } else if (data) {
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = item.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }, [])

  if (!user) {
    return <div>ログインしてください。</div>
  }

  if (isLoading) {
    return <div>読み込み中...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div 
      className="flex h-screen bg-background"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Sidebar */}
      <aside className="w-64 bg-muted p-4 hidden md:block">
        <nav className="space-y-2">
          <Button 
            variant={currentView === 'myDrive' ? "default" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setCurrentView('myDrive')}
          >
            <Home className="mr-2 h-4 w-4" />
            My Drive
          </Button>
          <Button 
            variant={currentView === 'starred' ? "default" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setCurrentView('starred')}
          >
            <Star className="mr-2 h-4 w-4" />
            Starred
          </Button>
          <Button 
            variant={currentView === 'trash' ? "default" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setCurrentView('trash')}
          >
            <Trash className="mr-2 h-4 w-4" />
            Trash
          </Button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col relative">
        {isDragging && (
          <div className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary flex items-center justify-center z-50">
            <p className="text-2xl font-bold text-primary">Drop files here to upload</p>
          </div>
        )}
        {/* Header */}
        <header className="border-b p-4">
          <div className="flex items-center space-x-4">
            <Input
              type="search"
              placeholder="Search in Drive"
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Dialog open={isNewItemDialogOpen} onOpenChange={setIsNewItemDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Item</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <RadioGroup
                      id="type"
                      value={newItemType}
                      onValueChange={(value: 'file' | 'folder') => setNewItemType(value)}
                      className="col-span-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="file" id="file" />
                        <Label htmlFor="file">File</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="folder" id="folder" />
                        <Label htmlFor="folder">Folder</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateNewItem}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              multiple
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </header>

        {/* File list */}
        <div className="flex-1 overflow-auto p-4">
          <h2 className="text-2xl font-bold mb-4">
            {currentView === 'myDrive' ? 'My Drive' : 
             currentView === 'starred' ? 'Starred' : 'Trash'}
          </h2>
          {filteredItems.length === 0 ? (
            <p>アイテムがありません。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Last modified</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item: Item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.type === 'folder' ? (
                        <Folder className="inline mr-2 h-4 w-4" />
                      ) : (
                        <File className="inline mr-2 h-4 w-4" />
                      )}
                      {item.name}
                    </TableCell>
                    <TableCell>{new Date(item.last_modified).toLocaleString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Rename</DropdownMenuItem>
                          <DropdownMenuItem>Move</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                          {item.type === 'file' && (
                            <DropdownMenuItem onClick={() => handleDownload(item)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  )
}