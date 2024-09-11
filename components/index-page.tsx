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
import { Folder, File, Search, Plus, MoreVertical, Home, Star, Trash } from 'lucide-react'

// Mock data for files and folders
const mockItems = [
  { id: 1, name: 'Documents', type: 'folder', lastModified: '2023-06-01' },
  { id: 2, name: 'Images', type: 'folder', lastModified: '2023-06-02' },
  { id: 3, name: 'report.pdf', type: 'file', lastModified: '2023-06-03' },
  { id: 4, name: 'presentation.pptx', type: 'file', lastModified: '2023-06-04' },
]

export function IndexPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = mockItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-muted p-4 hidden md:block">
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <Home className="mr-2 h-4 w-4" />
            My Drive
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Star className="mr-2 h-4 w-4" />
            Starred
          </Button>
          <Button variant="ghost" className="w-full justify-start">
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