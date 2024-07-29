import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


class ThreeJSContainer {
    private scene: THREE.Scene;
    private light: THREE.Light;
    private renderer:THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    private climberGroup: THREE.Group;
    private leftArm: THREE.Mesh;
    private rightArm: THREE.Mesh;
    private leftLeg: THREE.Mesh;
    private rightLeg: THREE.Mesh;
    private moving: boolean;
    private moveStartTime: number;
    private moveDuration: number;
    private startPos: THREE.Vector3;
    private endPos: THREE.Vector3;
    private currentStage: number;
    private pendulumStartTime: number;

    constructor() {
        this.moving = false;
        this.moveStartTime = 0;
        this.moveDuration = 2000;
        this.startPos = new THREE.Vector3();
        this.endPos = new THREE.Vector3();
        this.currentStage = 0;//現在の段階を管理
        this.pendulumStartTime = 0;
    }

    // 画面部分の作成(表示する枠ごとに)*
    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(new THREE.Color(0x495ed));
        this.renderer.shadowMap.enabled = true; //シャドウマップを有効にする

        //カメラの設定
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.copy(cameraPos);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

        this.createScene();
        // 毎フレームのupdateを呼んで，render
        // reqestAnimationFrame により次フレームを呼ぶ
        const render: FrameRequestCallback = (time) => {
            orbitControls.update();

            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);

        this.renderer.domElement.style.cssFloat = "left";
        this.renderer.domElement.style.margin = "10px";
        return this.renderer.domElement;
    };

    // シーンの作成(全体で1回)
    private createScene = () => {
        this.scene = new THREE.Scene();

        //ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);

        //ビルの作成
        this.createBuilding(2, 10, 2, 0, 5, 0);//一つ目のビル
        this.createBuilding(2, 10, 2, 5, 5, 0);//2つ目のビル

        //橋の作成
        this.createBridge();

        //登る人の作成
        this.createClimber();
    };

    private createBuilding = (width: number, height: number, depth: number, posX: number, posY: number, posZ: number) => {
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshLambertMaterial({color:0x888888});
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(posX, posY, posZ);//ビスの高さの半分を位置に設定
        this.scene.add(building);

        //窓の作成
        const windowGeometry = new THREE.PlaneGeometry(0.5, 0.5);
        const windowMaterial = new THREE.MeshLambertMaterial({color:0xffffff});

        const positions = [
            {xOffset: 0, zOffset: depth / 2 + 0.01, rotationY: 0},//前面
            {xOffset: 0, zOffset: -(depth / 2 + 0.01), rotationY: Math.PI},//背面
            {xOffset: width / 2 + 0.01, zOffset: 0, rotasionY: Math.PI /2},//右側面
            {xOffset: -(width / 2 + 0.01), zOffset: 0, rotationY: -Math.PI / 2}//左側面
        ];

        for(let y = 1; y <= 9; y ++){
            for(let x = -1; x <= 1; x ++){
                for(let pos of positions){
                this.addWindow(
                    windowGeometry,
                    windowMaterial,
                    posX + x * 0.75,//横位置
                    y,
                    posZ + pos.zOffset,
                    pos.rotationY
                );
            }
        }
    }
};

private createBridge = () => {
    const bridgeGeometry = new THREE.BoxGeometry(5, 0.1, 2);
    const bridgeMaterial = new THREE.MeshLambertMaterial({color: 0x444444});
    const bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
    bridge.position.set(2.5, 10.05, 0);//ビルの屋上の端に橋をおく
    this.scene.add(bridge);
};

    private createClimber = () => {
        this.climberGroup = new THREE.Group();
        const headGeometry = new  THREE.SphereGeometry(0.15, 32, 32);
        const bodyGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.2);
        const armGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.1);
        const legGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.1);
        const climberMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});

        const head = new THREE.Mesh(headGeometry, climberMaterial);
        head.position.set(0, 0.7, 0);

        const body = new THREE.Mesh(bodyGeometry, climberMaterial);
        body.position.set(0, 0.35, 0);

        this.leftArm = new THREE.Mesh(armGeometry, climberMaterial);
        this.leftArm.position.set(-0.2, 0.45, 0);

        this.rightArm = new THREE.Mesh(armGeometry, climberMaterial);
        this.rightArm.position.set(0.2, 0.45, 0);

        this.leftLeg = new THREE.Mesh(legGeometry, climberMaterial);
        this.leftLeg.position.set(-0.1, 0.1, 0);

        this.rightLeg = new THREE.Mesh(legGeometry, climberMaterial);
        this.rightLeg.position.set(0.1, 0.1, 0);

        this.climberGroup.add(head);
        this.climberGroup.add(body);
        this.climberGroup.add(this.leftArm);
        this.climberGroup.add(this.rightArm);
        this.climberGroup.add(this.leftLeg);
        this.climberGroup.add(this.rightLeg);

        this.climberGroup.position.set(0, 0.3, 1.5);//最初のビルの前面に配置
        this.scene.add(this.climberGroup);

        let update: FrameRequestCallback = (time) => {
            this.animateClimber(time);//人を上昇させる
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    };

    private animateClimber = (time: number) => {
        const speed = 0.01;

        if(this.moving){
            const elapsedTime = time - this.moveStartTime;
            if(elapsedTime >= this.moveDuration){
                this.climberGroup.position.copy(this.endPos);
                this.moving = false;
                this.currentStage ++;//次の段階へ移行
                return;//移動が終了したら止まる
            }else{
                const t = elapsedTime / this.moveDuration;
                this.climberGroup.position.lerpVectors(this.startPos, this.endPos, t);
            }
        }else if(this.climberGroup.position.y < 10){
            this.climberGroup.position.y += speed;

            if(this.climberGroup.position.y >= 10){
                this.startMove(new THREE.Vector3(1, 10, 0));//屋上の中心に向かう
            }
        }else if(this.currentStage === 1 && this.climberGroup.position.x < 1.5){
            this.startMove(new THREE.Vector3(1.5, 10, 0));//屋上の中心へ
        }else if(this.currentStage === 2 && this.climberGroup.position.x < 2){
            this.startMove(new THREE.Vector3(2, 10, 0));//橋の真ん中へ
        }else if(this.currentStage === 3 && this.climberGroup.position.x < 2.5){
            this.startMove(new THREE.Vector3(2.5, 10, 0));
        }else if(this.currentStage === 4 && this.climberGroup.position.x < 3){
            this.startMove(new THREE.Vector3(3, 10, 0));
        }else if(this.currentStage === 5 && this.climberGroup.position.x < 3.5){
            this.startMove(new THREE.Vector3(3.5, 10, 0));
        }else if(this.currentStage === 6 && this.climberGroup.position.x < 4){
            this.startMove(new THREE.Vector3(4, 10, 0));
        }else if(this.currentStage === 7 && this.climberGroup.position.x < 4.5){
            this.startMove(new THREE.Vector3(4.5, 10, 0));
        }else if(this.currentStage === 8 && this.climberGroup.position.x < 5){
            this.startMove(new THREE.Vector3(5, 10, 0));
        }

        if(this.currentStage <= 0){
            const armLegSpeed = 0.008;
            const angle = Math.sin(time * armLegSpeed);
            this.leftArm.rotation.z = angle;
            this.rightArm.rotation.z = -angle;
            this.leftLeg.rotation.z = -angle;
            this.rightLeg.rotation.z = angle;
        }else{
            this.leftArm.rotation.z = 0;
            this.rightArm.rotation.z = 0;
            this.leftLeg.rotation.z = 0;
            this.rightLeg.rotation.z = 0;
        }
    };

    private startMove = (targetPosition: THREE.Vector3) => {
        this.moving = true;
        this.moveStartTime = performance.now();
        this.startPos.copy(this.climberGroup.position);
        this.endPos.copy(targetPosition);
    };

    private addWindow = (
        geometry: THREE.PlaneGeometry,
        material: THREE.MeshLambertMaterial,
        x: number,
        y: number,
        z: number,
        rotationY: number = 0
    ) => {
        const windowMesh = new THREE.Mesh(geometry, material);
        windowMesh.position.set(x, y, z);
        windowMesh.rotation.y = rotationY;
        this.scene.add(windowMesh);
    }
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    let container = new ThreeJSContainer();

    let viewport = container.createRendererDOM(640, 480, new THREE.Vector3(10, 10, 10));
    document.body.appendChild(viewport);
}
