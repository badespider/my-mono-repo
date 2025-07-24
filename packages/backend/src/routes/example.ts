import { Router, Request, Response } from 'express';

// Temporarily inline definitions for smoke test
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

const router: Router = Router();

// In-memory store for demonstration
interface Item extends BaseEntity {
  name: string;
  description?: string;
}

let items: Item[] = [
  {
    id: '1',
    name: 'Sample Item 1',
    description: 'This is a sample item for demonstration',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Sample Item 2',
    description: 'Another sample item',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// GET /api/example - Get all items
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: items,
    count: items.length,
  });
});

// GET /api/example/:id - Get item by ID
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = items.find(item => item.id === id);

  if (!item) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: 'Item not found',
    });
  }

  res.json({
    success: true,
    data: item,
  });
});

// POST /api/example - Create new item
router.post('/', (req: Request, res: Response) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Name is required',
    });
  }

  const newItem: Item = {
    id: Date.now().toString(),
    name,
    description,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  items.push(newItem);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: newItem,
  });
});

// PUT /api/example/:id - Update item by ID
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const itemIndex = items.findIndex(item => item.id === id);

  if (itemIndex === -1) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: 'Item not found',
    });
  }

  if (!name) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Name is required',
    });
  }

  items[itemIndex] = {
    ...items[itemIndex],
    name,
    description,
    updatedAt: new Date(),
  };

  res.json({
    success: true,
    data: items[itemIndex],
  });
});

// DELETE /api/example/:id - Delete item by ID
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const itemIndex = items.findIndex(item => item.id === id);

  if (itemIndex === -1) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: 'Item not found',
    });
  }

  const deletedItem = items.splice(itemIndex, 1)[0];

  res.json({
    success: true,
    data: deletedItem,
    message: 'Item deleted successfully',
  });
});

export { router as exampleRouter };
