export type BlogCommentNode = {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date | string;
  parentId: string | null;
  children: BlogCommentNode[];
};

export function buildCommentTree(
  flat: Array<{
    id: string;
    authorName: string;
    content: string;
    createdAt: Date | string;
    parentId: string | null;
  }>,
): BlogCommentNode[] {
  const nodes = new Map<string, BlogCommentNode>();

  for (const comment of flat) {
    nodes.set(comment.id, { ...comment, children: [] });
  }

  const roots: BlogCommentNode[] = [];

  for (const comment of flat) {
    const node = nodes.get(comment.id);
    if (!node) continue;

    if (comment.parentId && nodes.has(comment.parentId)) {
      nodes.get(comment.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const byDate = (a: BlogCommentNode, b: BlogCommentNode) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

  const sortTree = (items: BlogCommentNode[]) => {
    items.sort(byDate);
    for (const item of items) {
      sortTree(item.children);
    }
  };

  sortTree(roots);
  return roots;
}

export function countCommentsInTree(comments: BlogCommentNode[]): number {
  return comments.reduce((total, comment) => total + 1 + countCommentsInTree(comment.children), 0);
}
