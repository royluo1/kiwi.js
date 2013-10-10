/**
* Component's are a snipnets of code which are designed to provide extra functionality to various objects, such as IChild's/GameObjects/HUDWidgets/e.t.c. The code that components have are not necessarily needed for an object to work, but are instead provided to make common task's that you would do with those objects easier. An Example being that at times you may like to make a GameObject draggable by the user and so you can then add Input Component and execute the enableDrag on that GameObject. That would be task that not every GameObject would need, but only specific ones. 
*  
* @module Kiwi
* @submodule Components 
* @main Components
*/ 
 
module Kiwi.Components {

    /**
    * The AnimationManager is used to handle the creation and playment of Animations on a individual GameObject based on the TextureAtlas it has. 
    * When the AnimationManager is instantiated it will loop through all of the Sequences on the TextureAtlas of the GameObject being used and will create a new Animation for each one.
    * Now when you create a new Animation that animation will automatically be added as a new Sequence to the corresponding Texture. 
    * This way you don't need to create new Animations for a each Sprite that use's the same Texture.
    *
    * @class AnimationManager
    * @extends Component
    * @constructor
    * @param entity {Entity} The entity that this animation component belongs to.
    * @return {AnimationManager}
    */
    export class AnimationManager extends Component {
         
        constructor(entity: Kiwi.Entity) {
            super(entity, 'Animation');

            //get the entity and the animation.
            this.entity = entity;
            this._atlas = this.entity.atlas; 
            this._animations = {};

            //create all of the default animations.
            for (var i = 0; i < this._atlas.sequences.length; i++) {
                this.createFromSequence(this._atlas.sequences[i], false);
            }

            //if a default animation already exists
            if (this._animations['default']) {
                this.currentAnimation = this._animations['default'];
            //otherwise create one.
            } else {
                var defaultCells = [];
                for (var i = 0; i < this._atlas.cells.length; i++) {
                    defaultCells.push(i);
                }
                this.currentAnimation = this.add('default', defaultCells, 0.1, true, false);
            }
        }

        /**
        * The entity that this animation belongs to.
        * @property entity
        * @type Entity
        * @private
        */
        private entity: Kiwi.Entity;

        /**
        * The texture atlas that this animation is taking affect on.
        * @property _atlas
        * @type TextureAtlas
        * @private
        */
        private _atlas: Kiwi.Textures.TextureAtlas;
        
        /**
        * A dictionary containing all of the animations that are avaiable.
        * @property _animations
        * @type Object
        * @private
        */
        private _animations: {};

        /**
        * A reference to the animation that is currently being played.
        * @property _currentAnimation
        * @type Animation
        * @default null
        * @private
        */
        public currentAnimation: Kiwi.Animations.Animation = null;

        /**
        * Indicates whether or not this animation is currently playing or not.
        * @property _isPlaying
        * @type boolean
        * @default false
        * @private
        */
        private _isPlaying: boolean = false;
        
        /**
        * Returns a boolean indicating whether or not the current animation is playing. This is READ ONLY.
        * @property isPlaying
        * @type boolean
        * @public
        */
        public get isPlaying(): boolean {
            return this._isPlaying;
        }
        
        /**
        * The type of object that this is.
        * @method objType
        * @type string
        * @public
        */
        public objType() {
            return "AnimationManager";
        }

        /**
        * Creates a new sequence and then adds that sequence as a new animation on this component. Returns that animation that was created.
        *
        * @method add
        * @param {string} name
        * @param cells {number[]} An array that contains a reference to the cells that are to be played in the animation. 
        * @param speed {number} The amount of time that each frame should stay on screen for. In seconds.
        * @param [loop=false] {boolean} If when the animation reaches the last frame, it should go back to the start again.
        * @param [play=false] {boolean} If once created the animation should play right away.
        * @return {Animation} The Anim that was created.
        * @public
        */
        public add(name: string, cells: number[], speed: number, loop: boolean= false, play: boolean= false): Kiwi.Animations.Animation {
            var newSequence = new Kiwi.Animations.Sequence(name, cells, speed, loop);
            this._atlas.sequences.push(newSequence);
            
            return this.createFromSequence(newSequence, play);
        }

        /**
        * Creates a new animation based on a sequence that is passed. 
        *
        * @method createFromSequence
        * @param sequence {Kiwi.Sequence} The sequence that the animation is based on.
        * @param [play=false] {boolean} If the animation should play once it has been created
        * @return {Animation} The Anim that was created.
        * @public
        */
        public createFromSequence(sequence: Kiwi.Animations.Sequence, play: boolean= false): Kiwi.Animations.Animation {
            this._animations[sequence.name] = new Kiwi.Animations.Animation(sequence.name, sequence, this.entity.clock);

            if (play) this.play(sequence.name);
            
            return this._animations[sequence.name];
        }

        /**
        * Plays either the current animation or the name of the animation that you pass.
        * 
        * @method play
        * @param [name] {string} The name of the animation that you want to play. If not passed it plays the current animation.
        * @public
        */
        public play(name: string = this.currentAnimation.name): Kiwi.Animations.Animation {

            return this._play(name);
        }
        
        /**
        * Play an animation at a particular frameIndex. 
        * 
        * @method playAt
        * @param index {Number} The index of the frame in the Sequence that you would like to play.
        * @param [name] {String} The name of the animation that you want to play. If not passed, it plays it on the current animation.
        * @public
        */
        public playAt(index: number, name: string = this.currentAnimation.name): Kiwi.Animations.Animation {
            
            return this._play(name, index);
        } 

        /**
        * An internal method used to actually play the animation.
        * 
        * @method _play
        * @param name {number} The name of the animation that is to be switched to.
        * @param [index=null] {string} The index of the frame in the Sequence that is to play.
        * @return {Animation}
        * @private
        */
        private _play(name: string, index: number=null): Kiwi.Animations.Animation {
            
            this._isPlaying = true;
            this._setCurrentAnimation(name); 
            
            if (index !== null)
                this.currentAnimation.playAt(index);
            else
                this.currentAnimation.play();
            
            this._setCellIndex();

            return this.currentAnimation;
        }

        /**
        * Stops the current animation from playing.
        * @method stop
        * @public
        */
        public stop() {
            if (this.isPlaying === true) {
                this.currentAnimation.stop();
            }
            this._isPlaying = false;
        }

        /**
        * Pauses the current animation.
        * @method pause
        * @public
        */ 
        public pause() {
            this.currentAnimation.pause();
            this._isPlaying = false;
        }

        /**
        * Resumes the current animation. The animation should have already been paused.
        * @method resume
        * @public
        */
        public resume() {
            this.currentAnimation.resume();
            this._isPlaying = true;
        }

        /**
        * Either switchs to a particular animation or a particular frame in an animation depending on if you pass a string or a number. 
        * You can also force the animation to play or to stop by passing a boolean in. But if left as null, the animation will base it off what is currently happening.
        * So if the animation is currently 'playing' then once switched to the animation will play. If not currently playing it will switch to and stop.
        *
        * @method switchTo
        * @param val {string|number}
        * @param [play=null] {boolean} Force the animation to play or stop. If null the animation base's it off what is currently happening.
        * @public
        */
        public switchTo(val: any, play:boolean=null) { 
            switch (typeof val) {
                case "string":
                    if (this.currentAnimation.name !== val) {
                        this._setCurrentAnimation(val);
                    }
                    break;
                case "number":
                    this.currentAnimation.frameIndex = val;
                    break;
            }

            if (play || play === null && this.isPlaying) this.play();
            if (play == false && this.isPlaying) this.stop();

            this._setCellIndex();
        }

        /**
        * Makes the current animation go to the next frame. If the animation is at the end of the sequence it then goes back to the start.
        * @method nextFrame
        * @public
        */
        public nextFrame() {
            this.currentAnimation.nextFrame();
            this._setCellIndex();
        }
        
        /**
        * Makes the current animation go to the prev frame. If the animation is at the start, the animation will go the end of the sequence.
        * @method prevFrame
        * @public
        */
        public prevFrame() {
            this.currentAnimation.prevFrame();
            this._setCellIndex();
        }

        /**
        * Internal method that sets the current animation to the animation passed.
        *
        * @method _setCurrentAnimation
        * @param {string} name
        * @private
        */
        private _setCurrentAnimation(name: string) {

            if (this.currentAnimation !== null) this.currentAnimation.stop();
            if (this._animations[name]) {
                this.currentAnimation = this._animations[name]; 
            }  
        }

        /**
        * The update loop, it only updates the currentAnimation and only if it is playing.
        * @method update 
        * @public
        */
        public update() { 
            if (this.currentAnimation && this.isPlaying) {
                if (this.currentAnimation.update()) {
                    this._setCellIndex();
                }
            }
        }
        
        /**
        * Gets the cell that the current animation is current at. This is READ ONLY.
        * @property currentCell
        * @type number
        * @public
        */
        public get currentCell():number {
            return this.currentAnimation.currentCell;
        }

        /**
        * Gets the current frame index of the cell in the sequence that is currently playing. This is READ ONLY.
        * @property frameIndex 
        * @type number
        * @public
        */
        public get frameIndex():number {
            return this.currentAnimation.frameIndex;
        }

        /**
        * Returns the length (Number of cells) of the current animation that is playing. This is READ ONLY.
        * @property length
        * @type number
        * @public
        */
        public get length(): number {
            return this.currentAnimation.length;
        }

        /**
        * Get a animation that is on the animation component. 
        * 
        * @method getAnimation
        * @param {string} name
        * @return {Animation} 
        * @public
        */
        public getAnimation(name: string): Kiwi.Animations.Animation {
            return this._animations[name];
        }
        
        /**
        * An internal method that is used to set the cell index of the entity. This is how the animation changes.
        * @method _setCellIndex
        * @private
        */
        private _setCellIndex() {
            this.entity.cellIndex = this.currentCell;
        }

	    /**
	    * Returns a string representation of this object.
	    * @method toString
	    * @return {string} A string representation of this object.
        * @public
	    */
        public toString(): string {

            return '[{Animation (x=' + this.active + ')}]';

        }

        /**
        * Destroys the animation component and runs the destroy on all of the anims that it has.
        * @method destroy
        * @public
        */
        public destroy() {
            this._isPlaying = false;
            super.destroy();

            for (var key in this._animations) {
                this._animations[key].destroy();
                delete this._animations[key];
            }
            delete this._animations;
            delete this.currentAnimation;
            delete this._atlas;
        }

    }

}

