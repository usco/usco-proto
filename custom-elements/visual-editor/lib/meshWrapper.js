

function Part(geometry, material)
{
        THREE.Object3D.call( this );
        //this.innerMesh = mesh
        this.geometry = geometry;//indirection
        this.material = material;

        this.innerMesh = new THREE.Mesh(geometry,material);
        this.add(this.innerMesh);
}

Part.prototype = Object.create( THREE.Object3D.prototype );
Part.prototype.constructor = Part;

