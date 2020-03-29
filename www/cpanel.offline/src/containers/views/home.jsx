import React from "react";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import { fetchNewTime } from '../../redux/actionCreators.jsx';
import {Typography, TextField, Paper, Button } from '@material-ui/core'
import { List, ListItem, ListItemText , ListItemSecondaryAction,  IconButton} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { createMuiTheme } from '@material-ui/core/styles'
import { orange } from '@material-ui/core/colors'
import {  MuiThemeProvider } from '@material-ui/core/styles'

function styles(theme){
  return(
  {root: {margin: 20, padding: 20, maxWidth: 400}, form: {display: 'flex', alignItems: 'baseline', justifyContent: 'space-evenly'}}
  );
}

const theme = createMuiTheme({palette: {primary: {light: orange[200],main: '#FB8C00',dark: '#EF6C00', contrastText: 'rgb(0,0,0)'}}})

export class Home extends React.Component {
  constructor(props){
    super(props);
    this.state={exercises:[],title:''}
  }
  
  handleChange({target: {name, value}}){
    this.setState({[name]: value});
  }
  
  handleCreate(e){
    e.preventDefault();
    if (this.state.title) {
      this.setState(({exercises, title}) => ({
        exercises: [...exercises,{title,id: Date.now()}],
        title:''
        }));
    }
  }
  
  handleDelete(id){
    this.setState(({ exercises }) => ({ exercises: exercises.filter(ex => ex.id !== id) }))
  }
  
  render(){
    const {title, exercises} = this.state;
    const props = this.props;
    const { classes } = this.props
    return (
      <div className="home">
      <MuiThemeProvider theme={theme}>
        <Paper className={classes.root}>
        <Typography variant='h1' align='center' gutterBottom>Exercises</Typography>
        
        <form onSubmit={this.handleCreate.bind(this)} className={classes.form}>
          <TextField name='title' label='Exercise' value={title} onChange={this.handleChange.bind(this)} margin='normal'/>
          <Button type='submit' color='primary' variant='contained'>Create</Button>
        </form>
        <List>
          {exercises.map(({ id, title }) =>
            <ListItem key={id}>
              <ListItemText primary={title} />
              <ListItemSecondaryAction>
                <IconButton color='primary' onClick={()=>this.handleDelete(id)}>X</IconButton>
              </ListItemSecondaryAction>
            </ListItem>
           )}
        </List>
        </Paper>
        </MuiThemeProvider>
        
        <br/>
        <p>Current time: {props.currentTime}</p>
        <button onClick={props.updateTime}>
          Update time
        </button>
      </div>
    );
  }
}

import { connect } from "react-redux";
const mapStateToProps = state => {
  return {
    currentTime: state.time.currentTime
  };
};

const mapDispatchToProps = dispatch => ({
  updateTime: () => dispatch(fetchNewTime())
})

export default connect(mapStateToProps, mapDispatchToProps)( withStyles(styles) (Home) );