import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import {GridListTileBar,  ListSubheader} from '@material-ui/core';
// import tileData from './tileData';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: '100%',
    height: 450,
  },
}));


const tileData = [
    {
        img: 'assets/Got.jpg',
        label: 'GOT',
        confidence: '98%',
    },
    {
        img: 'assets/Stark.jpg',
        label: 'Stark',
        confidence: '67%',
    },
    {
        img: 'assets/wallpaper.jpg',
        label: 'Wallpaper',
        confidence: '90%',
    },
    {
        img: 'assets/Screenshot (1).png',
        label: 'Wallpaper',
        confidence: '90%',
    },
    {
        img: 'assets/Screenshot (2).png',
        label: 'Wallpaper',
        confidence: '90%',
    },
    {
        img: 'assets/Screenshot (3).png',
        label: 'Wallpaper',
        confidence: '90%',
    },
    {
        img: 'assets/Screenshot (4).png',
        label: 'Wallpaper',
        confidence: '90%',
    },
    {
        img: 'assets/Screenshot (5).png',
        label: 'Wallpaper',
        confidence: '90%',
    },
];

export default function ImageGridList(props) {
  const classes = useStyles();
    
  return (
    <div className={classes.root}>
      <GridList cellHeight={180} className={classes.gridList} cols = {4}>
        
        {props.files.map(tile => (
          <GridListTile key={tile.img}>
            <img src={tile.image} alt={tile.label} />
            {(props.submit)?<GridListTileBar
              title={tile.label}
              subtitle={<span>Confidence: {tile.confidence}</span>}
            />: null}
            
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}
