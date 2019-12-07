import React from 'react';
import {SharedElement, useNavigator} from 'react-animated-navigator';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import {formatRelative} from 'date-fns';

export default function SearchAppBar() {
  const [, , location] = useNavigator()
  const sourceId = (location.location.state && location.location.state.sourceId) || "-"
  const task = (location.location.state && location.location.state.task) || {}

  const now = new Date()

  return (
    <div>

      <SharedElement id={sourceId}>
        <ListItem>
          <ListItemText primary={task.name} secondary={formatRelative(new Date(task.createdAt), now)} />
        </ListItem>
      </SharedElement>




    </div>
  )
}