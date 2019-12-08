import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import DoneIcon from '@material-ui/icons/Done';
import {Typography} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    background: ({background}) => background,
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: ({variant}) => (variant === 'right') ? 'flex-end' : 'flex-start',
    color: '#fff'
  },
  hint: {
    textAlign: 'center',
    width: 100
  }

}));


export default ({icon, label, background, variant}) => {
  const classes = useStyles({background, variant});

  return (
    <div className={classes.root}>
      <div className={classes.hint}>
        {icon}
        <Typography>{label}</Typography>
      </div>
    </div>
  );
}