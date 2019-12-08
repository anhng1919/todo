import React, {useReducer, useState} from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import {fade, makeStyles} from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import DoneIcon from '@material-ui/icons/Done';
import DeleteIcon from '@material-ui/icons/Delete';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import {useNavigator} from 'react-animated-navigator';
import {useQuery, useSubscription} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {formatRelative} from 'date-fns';
import Divider from '@material-ui/core/Divider';
import produce from 'immer';
import emptyIcon from '../../images/empty.png';
import {Code} from 'react-content-loader';
import {SwipeableList, SwipeableListItem} from '@sandstreamdev/react-swipeable-list';
import '@sandstreamdev/react-swipeable-list/dist/styles.css';
import {SwipeHint} from "../../components/SwipeHint";
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import {CSSTransition, TransitionGroup} from 'react-transition-group';

const useStyles = makeStyles(theme => ({
  barRoot: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 120,
      '&:focus': {
        width: 200,
      },
    },
  },



  listRoot: {
    width: '100%',
    height: '100vh'
  },
  listItem: {
    width: '100%',
  },

  finishedTask: {
    textDecoration: 'line-through'
  },


  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },

  loadingRoot: {
    margin: theme.spacing(3),
  }
}))

const TASKS_QUERY = gql`
    query {
        tasks {
            uuid
            position
            name
            isFinished
            createdAt
        }
    }
`

const TASKS_SUBSCRIPTION = gql`
    subscription {
        taskWasNoted {
            uuid
            name
            createdAt
        }
    }
`


const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TASKS':
      return produce(state, draftState => {
        draftState.data = action.tasks
        draftState.loading = false
      })
    case 'APPEND_TASK':
      return produce(state, draftState => {
        draftState.data.push(action.task)
      })
    case 'REMOVE_TASK':
      return produce(state, draftState => {
        const currentTask = draftState.data.find(task => task.uuid === action.uuid)

        draftState.data = draftState.data.filter(task => task.uuid !== action.uuid)

        draftState.data
          .filter(task => task.position > currentTask.position)
          .forEach(task => {
            task.position--
          })

      })
    case 'FINISH_TASK':
      return produce(state, draftState => {
        const currentTask = draftState.data.find(task => task.uuid === action.uuid)
        currentTask.isFinished = true
      })
    case 'REDO_TASK':
      return produce(state, draftState => {
        const currentTask = draftState.data.find(task => task.uuid === action.uuid)
        currentTask.isFinished = false
      })
    case 'MOVE_TASK_UP':
      return produce(state, draftState => {
        const currentTask = draftState.data.find(task => task.uuid === action.uuid)

        draftState.data
          .filter(task => task.position === currentTask.position - 1)
          .forEach(task => {
            task.position++
          })

        currentTask.position--

      })
    case 'MOVE_TASK_DOWN':
      return produce(state, draftState => {
        const currentTask = draftState.data.find(task => task.uuid === action.uuid)

        draftState.data
          .filter(task => task.position === currentTask.position + 1)
          .forEach(task => {
            task.position--
          })

        currentTask.position++

      })
    default:
      throw new Error('INVALID_ACTION')
  }
}

export default function SearchAppBar() {
  const classes = useStyles()
  const [go] = useNavigator()

  // const seeTaskDetail = (task, sourceId) => {
  //   go({
  //     pathname: `/${task.uuid}`,
  //     state: {
  //       sourceId,
  //       task
  //     }
  //   })
  // }

  const [tasks, dispatch] = useReducer(taskReducer, {
    loading: true,
    data: [],
    deletingUuids: []
  })

  useQuery(TASKS_QUERY, {
      fetchPolicy: 'network-only',
      onCompleted: data => {
        dispatch({
          type: 'SET_TASKS',
          tasks: data.tasks
        })
      }
    }
  )

  useSubscription(TASKS_SUBSCRIPTION, {
    onSubscriptionData: ({ subscriptionData }) => {
      const newTask = subscriptionData.data.taskWasNoted;

      dispatch({
        type: 'APPEND_TASK',
        task: newTask
      })
    }
  })


  const [keyword, setKeyword] = useState('')

  const now = new Date()

  // console.log(tasks.data)

  return (
    <div>
      <div className={classes.barRoot}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Typography className={classes.title} variant="h6" noWrap>
              Todo
            </Typography>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                value={keyword}
                onChange={event => setKeyword(event.target.value)}
                placeholder="Search…"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                inputProps={{ 'aria-label': 'search' }}
              />
            </div>
          </Toolbar>
        </AppBar>
      </div>


      {(!tasks.loading) ?
        (tasks.data.length > 0 ?
            (
              <List className={classes.listRoot}>

                <SwipeableList>
                  <TransitionGroup>
                  {tasks.data
                    .filter(task => task.name.toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) > -1)
                    .map((task, index) => (
                      <CSSTransition
                        key={task.uuid}
                        timeout={200}
                        classNames="item"
                      >
                      <div key={task.uuid} className="item" style={{
                        top: (keyword === '') ? task.position * 73 : index * 73,
                      }}>
                        <SwipeableListItem
                          swipeRight={
                            task.isFinished ?
                            {
                              content: <SwipeHint variant="left" icon={<DoneIcon/>} label="Redo" background="#ffc107"/>,
                              action: () => setTimeout(() => dispatch({
                                type: 'REDO_TASK',
                                uuid: task.uuid
                              }), 500)
                            }
                            :
                            {
                              content: <SwipeHint variant="left" icon={<DoneIcon/>} label="Done" background="#357a38"/>,
                              action: () => setTimeout(() => dispatch({
                                type: 'FINISH_TASK',
                                uuid: task.uuid
                              }), 500)
                            }
                          }
                          swipeLeft={{
                            content: <SwipeHint variant="right" icon={<DeleteIcon/>} label="Delete" background="#ff1744"/>,
                            action: () => dispatch({
                              type: 'REMOVE_TASK',
                              uuid: task.uuid
                            })
                          }}
                        >
                          <ListItem classes={{
                            container: classes.listItem
                          }}>
                            <ListItemText className={task.isFinished ? classes.finishedTask : null} primary={task.name} secondary={formatRelative(new Date(task.createdAt), now)} />

                            {keyword === '' && (
                              <ListItemSecondaryAction>
                                <IconButton disabled={task.position === 0} edge="end" onClick={() => dispatch({
                                  type: 'MOVE_TASK_UP',
                                  uuid: task.uuid
                                })}>
                                  <ArrowUpwardIcon />
                                </IconButton>
                                <IconButton disabled={task.position === tasks.data.length - 1} edge="end" onClick={() => dispatch({
                                  type: 'MOVE_TASK_DOWN',
                                  uuid: task.uuid
                                })}>
                                  <ArrowDownwardIcon />
                                </IconButton>
                              </ListItemSecondaryAction>
                            )}
                          </ListItem>

                        </SwipeableListItem>
                        <Divider/>
                      </div>
                      </CSSTransition>
                    ))}
                  </TransitionGroup>
                </SwipeableList>
              </List>
            )
            :
            (
              <div><img src={emptyIcon} width={'100%'} /></div>
            )
        )
        :
        (
          <div className={classes.loadingRoot}>
            <Code />
          </div>
        )
      }


      <Fab color="primary" aria-label="add" className={classes.fab} onClick={() => go('/new', 'flyUp')}>
        <AddIcon />
      </Fab>
    </div>
  )
}