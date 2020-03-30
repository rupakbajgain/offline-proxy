import React from "react";
import {Typography, TextField, Paper, Button } from '@material-ui/core'
import { fade, withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import clsx from 'clsx'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';

function styles(theme){
  return(
  {
    root:{
      display: 'flex',
      flexGrow: 1,
    },
    title:{
      flexGrow: 1,
      display: 'none',
      [theme.breakpoints.up('sm')]:{
        display: 'block',
      }
    },
    search:{
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
      padding: theme.spacing(0, 2),
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
      padding: theme.spacing(1, 1, 1, 0),
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: '12ch',
        '&:focus': {
          width: '20ch',
          }
       }
    }
  }
)}

export class Dashboard extends React.Component {
  constructor(props){
    super(props);
  }
  
  render(){
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" color="inherit">
              Proxy App
            </Typography>

            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
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
    );
  }
}

import { connect } from "react-redux";
const mapStateToProps = state => {
  return {
    //currentTime: state.time.currentTime
  };
};

const mapDispatchToProps = dispatch => ({
  //updateTime: () => dispatch(fetchNewTime())
})

export default connect(mapStateToProps, mapDispatchToProps)( withStyles(styles) (Dashboard) );