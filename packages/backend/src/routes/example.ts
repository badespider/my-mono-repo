import { Router, Request, Response } from 'express';

const router = Router();

// In-memory storage for demonstration (replace with database in production)
interface ExampleItem {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

let items: ExampleItem[] = [
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
    return res.status(404).json({
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
    return res.status(400).json({
      success: false,
      error: 'Name is required',
    });
  }

  const newItem: ExampleItem = {
    id: Date.now().toString(),
    name,
    description,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  items.push(newItem);

  res.status(201).json({
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
    return res.status(404).json({
      success: false,
      error: 'Item not found',
    });
  }

  if (!name) {
    return res.status(400).json({
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
    return res.status(404).json({
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
