import { generate } from 'astring';
import * as es from 'estree';
import { Context } from 'js-slang/dist/types';
import * as React from 'react';

export class SubstTimeline extends React.PureComponent<ISubstTimelineProps, ISubstTimelineState> {

  private trees? : Array<[es.Node, Context]>;
  private mounted = false;
  private slider : HTMLInputElement | null;
  
  constructor(props : ISubstTimelineProps) {
    super(props);
    this.trees = props.trees;
    
    this.updateTrees = this.updateTrees.bind(this);
    this.getFinalValue = this.getFinalValue.bind(this);
    
    this.sliderChanged = this.sliderChanged.bind(this);
    this.sliderShift = this.sliderShift.bind(this);
    this.stepFirst = this.stepFirst.bind(this);
    this.stepPrev = this.stepPrev.bind(this);
    this.stepNext = this.stepNext.bind(this);
    this.stepLast = this.stepLast.bind(this);

    this.enableFirstAndPrevButton = this.enableFirstAndPrevButton.bind(this);
    this.enableLastAndNextButton = this.enableLastAndNextButton.bind(this);
  }

  public componentDidMount() {
    this.mounted = true;
  }

  public render() {

    const value = (this.state && this.state.value) ? this.state.value : 0;

    return (
      <div>
        <div>
          {this.trees
            ? this.generateFromTree(this.trees[value][0])
            : "Start writing some code on the left, then drag the slider below to see it's evaluation."
          }
        </div>
        <span>
          <button onClick={this.stepFirst} disabled={!this.enableFirstAndPrevButton()}>{"|<"}</button>
          <button onClick={this.stepPrev} disabled={!this.enableFirstAndPrevButton()}>{"<"}</button>
          <button onClick={this.stepNext} disabled={!this.enableLastAndNextButton()}>{">"}</button>
          <button onClick={this.stepLast} disabled={!this.enableLastAndNextButton()}>{">|"}</button>
          <input ref={x=>this.slider=x} id="substSlider" type="range" min="0" max={this.trees? this.trees.length-1 : 0} defaultValue="0" onChange={this.sliderChanged}/>
        </span>
      </div>
    );
  }

  public updateTrees(newTrees : Array<[es.Node, Context]>){
    
    this.trees = newTrees;

    if (this.mounted) {
      this.trees = newTrees;

      if (this.slider) {
        this.slider.value = "0";
      }

      this.setState({trees: this.trees});

      if (this.slider) {
        this.slider.max = (this.trees.length - 1).toString();
        this.slider.value = (this.trees.length - 1).toString();
        this.setState({value: this.sliderValue()});
      }
    }
    else {
      alert("unmounted");
    }
  }

  public getFinalValue() {

    if (this.trees) {
      return this.generateFromTree(this.trees[this.trees.length-1][0]);
    }
    else {
      return "";
    }
  }

  private sliderChanged(event : React.ChangeEvent<HTMLInputElement>) {

    const newValue = parseInt(event.target.value, 10);
    this.setState({value: newValue, trees: this.state.trees});
  }

  private sliderShift(newValue : number) {

    if (this.slider) {

      if (newValue < 0 || newValue > parseInt(this.slider.max, 10)) {
        alert("Slider is already at most extreme value.");
      }
      else {
        this.slider.value = newValue.toString();
        this.setState({value: newValue, trees: this.state.trees});
      }
    }
  }


  private generateFromTree(tree : es.Node) : string {
    return generate(tree);
  }

  private sliderValue() {
    return this.slider ? parseInt(this.slider.value, 10) : -1;
  }




  private stepFirst() {
    this.sliderShift(0);
  }

  private stepLast() {
    this.sliderShift(this.trees ? this.trees.length - 1 : 0);
  }

  private stepPrev() {
    this.sliderShift(this.sliderValue() - 1);
  }

  private stepNext() {
    this.sliderShift(this.sliderValue() + 1);
  }

  private enableFirstAndPrevButton() {
    return this.trees && this.state && this.mounted && this.sliderValue() > 0;
  }

  private enableLastAndNextButton() {
    return this.trees && this.state && this.mounted && this.sliderValue() < this.trees.length-1 && this.sliderValue() >= 0;
  }
}

export interface ISubstTimelineState {
  value : number;
  trees : Array<[es.Node, Context]>;
}

export interface ISubstTimelineProps {
  trees? : Array<[es.Node, Context]>; 
}

export default SubstTimeline;