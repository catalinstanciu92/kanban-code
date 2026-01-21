import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('http://localhost:7895/api/config', () => {
    return HttpResponse.json({
      columns: [
        { id: 'todo', name: 'Todo', color: '#6366f1', file: 'todo.csv', order: 1 },
        { id: 'done', name: 'Done', color: '#10b981', file: 'done.csv', order: 2 },
      ],
    })
  }),

  http.get('http://localhost:7895/api/tasks', () => {
    return HttpResponse.json({
      todo: [],
      done: [],
    })
  }),

  http.post('http://localhost:7895/api/tasks', async ({ request }) => {
    const body = await request.json() as { title: string; columnId: string }
    return HttpResponse.json({
      id: 'mock-id',
      title: body.title,
      columnId: body.columnId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
    }, { status: 201 })
  }),

  http.put('http://localhost:7895/api/tasks/:id/move', () => {
    return HttpResponse.json({ success: true })
  }),
]
