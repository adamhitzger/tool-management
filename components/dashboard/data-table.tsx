import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  title?: string
  description?: string
  columns: Column<T>[]
  data: T[]
  linkPrefix?: string
  linkKey?: keyof T
  emptyMessage?: string
}

export function DataTable<T extends object>({
  title,
  description,
  columns,
  data,
  linkPrefix,
  linkKey,
  emptyMessage = "Žádná data k zobrazení",
}: DataTableProps<T>) {
  const rowLinkEnabled = Boolean(linkPrefix && linkKey)

  return (
    <Card className="bg-card border-border overflow-hidden">
      {(title || description) && (
        <div className="px-5 py-4 border-b border-border">
          {title && (
            <h3 className="font-semibold text-card-foreground">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={`text-muted-foreground font-medium text-xs uppercase tracking-wider ${
                    column.className || ""
                  }`}
                >
                  {column.header}
                </TableHead>
              ))}
              {rowLinkEnabled && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (rowLinkEnabled ? 1 : 0)}
                  className="text-center text-muted-foreground py-8"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const href =
                  rowLinkEnabled && linkPrefix && linkKey
                    ? `${linkPrefix}/${String((row as any)[linkKey])}`
                    : null

                return (
                  <TableRow
                    key={index}
                    className={`border-border transition-colors ${
                      rowLinkEnabled
                        ? "hover:bg-secondary/50 cursor-pointer relative"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={String(column.key)}
                        className={`text-card-foreground ${
                          column.className || ""
                        }`}
                      >
                        {href && colIndex === 0 && (
                          <Link
                            href={href}
                            className="absolute inset-0 z-10"
                            aria-label="Open row"
                          />
                        )}

                        <span className="relative z-20">
                          {column.render
                            ? column.render(row)
                            : String((row as any)[column.key] ?? "-")}
                        </span>
                      </TableCell>
                    ))}

                    {rowLinkEnabled && (
                      <TableCell className="text-right">
                        <span className="relative z-20 inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-secondary transition-colors">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </span>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
