 //OLD code used to refresh linked clones helper on transform controls changed event
 if( this.selectedObjects.length>0 && this.selectedObjects[0].lClones || this.selectedObjects[0].parent.parent._original)
  {
    if( this.selectedObjects[0].cloneLink) this.selectedObjects[0].remove( this.selectedObjects[0].cloneLink );
    drawLinkToLinkedClones(this.selectedObjects[0]);
  }
