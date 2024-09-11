'use client'

import { useState } from 'react'
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
import { Folder, File, Plus, MoreVertical, Home, Star, Trash } from 'lucide-react'

// Mock data for files and folders
const mockItems = [
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

  return (
    <div className="flex h-screen bg-background">
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
      <main className="flex-1 flex flex-col">
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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New
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