export class Tree {
  private _nodes: Node[] = []

  constructor() {}


  get nodes(): Node[] {
    return this._nodes
  }

  set nodes(value: Node[]) {
    this._nodes = value
  }
}

// for Patternfly, it should extend TreeViewDataItem
export class Node {
  private readonly _id: string
  private _name: string
  private _children?: Node[]
  private _selected: boolean
  private _expanded: boolean

  get id(): string {
    return this._id
  }

  get name(): string {
    return this._name
  }

  get children(): Node[] | undefined {
    return this._children
  }

  set children(value: Node[]) {
    this._children = value
  }

  get selected(): boolean {
    return this._selected
  }

  set selected(value: boolean) {
    this._selected = value
  }

  get expanded(): boolean {
    return this._expanded
  }

  set expanded(value: boolean) {
    this._expanded = value
  }

  constructor(id: string) {
    this._id = id
    this._selected = false
    this._expanded = false
  }
}
