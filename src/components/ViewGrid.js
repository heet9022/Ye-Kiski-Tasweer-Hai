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
    width: 600,
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
];

export default function ImageGridList() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <GridList cellHeight={180} cellWidth={180} className={classes.gridList} cols = {3}>
        
        {tileData.map(tile => (
          <GridListTile key={tile.img}>
            <img src={tile.img} alt={tile.label} />
            <GridListTileBar
              title={tile.label}
              subtitle={<span>Confidence: {tile.confidence}</span>}
            />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}
