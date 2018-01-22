# listview-navigator

Delegate arrow key down or up operation on list container. For a list, it will be a more friendly interaction if it could react to `uparrow or downarrow` event. That's why this package exist. However, for this packages it has some constraints and requirement:

1. The length of list should be set on initial state.

2. List item should have fixed height.

## usage

```js
import ListViewNavigator from 'listview-navigator';

this.listNavigator = new ListViewNavigator({
  target: this.listNode,
  max: this.dataSource.length,
  itemHeight: this.itemHeight,
});
```

On press <kbd>uparrow</kbd> or <kbd>downarrow</kbd>, it will emit <kbd>change</kbd> event. The arguments on callback function will `nextIndex` and `index`;

```js
this.listNavigator.on('change', (nextIndex, index) => {
  // ...
})
```

On press <kbd>Enter</kbd>, it will emit <kbd>commit</kbd> event. The arguments on callback function will `nextIndex` and `index`;

```js
this.listNavigator.on('commit', (nextIndex, index) => {
  // ...
})
```

## API

### `ListViewNavigator`

#### Arguments

- `target`(HTMLElement): The list container which will delegated to.
- `itemHeight`(Number): The list item height.
- `max`(Number): The count of list items
