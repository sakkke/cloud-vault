'use client'

import { useState, useRef, useCallback } from 'react'
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
import { Folder, File, Search, Plus, MoreVertical, Home, Star, Trash, Upload } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// Mock data for files and folders
const initialMockItems = [
  { id: 1, name: 'Documents', type: 'folder', lastModified: '2023-06-01' },
  { id: 2, name: 'Images', type: 'folder', lastModified: '2023-06-02' },
  { id: 3, name: 'report.pdf', type: 'file', lastModified: '2023-06-03' },
  { id: 4, name: 'presentation.pptx', type: 'file', lastModified: '2023-06-04' },
]

const starredItems = [
  { id: 3, name: 'report.pdf', type: 'file', lastModified: '2023-06-03' },
]

const trashedItems = [
  { id: 5, name: 'old_document.docx', type: 'file', lastModified: '2023-05-15' },
]

export function IndexPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentView, setCurrentView] = useState('myDrive')
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemType, setNewItemType] = useState('file')
  const [mockItems, setMockItems] = useState(initialMockItems)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFilteredItems = () => {
    let items
    switch (currentView) {
      case 'starred':
        items = starredItems
        break
      case 'trash':
        items = trashedItems
        break
      default:
        items = mockItems
    }
    return items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const filteredItems = getFilteredItems()

  const handleCreateNewItem = () => {
    const newItem = {
      id: Date.now(),
      name: newItemName,
      type: newItemType,
      lastModified: new Date().toISOString().split('T')[0]
    }
    setMockItems([...mockItems, newItem])
    setIsNewItemDialogOpen(false)
    setNewItemName('')
    setNewItemType('file')
  }

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        type: 'file',
        lastModified: new Date().toISOString().split('T')[0]
      }))
      setMockItems([...mockItems, ...newFiles])
    }
  }

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
                      onValueChange={setNewItemType}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Last modified</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.type === 'folder' ? (
                      <Folder className="inline mr-2 h-4 w-4" />
                    ) : (
                      <File className="inline mr-2 h-4 w-4" />
                    )}
                    {item.name}
                  </TableCell>
                  <TableCell>{item.lastModified}</TableCell>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}