"""Build the stylized Memorial 9 de Novembro pilot asset.

Run with Blender:
blender --background --factory-startup --python scripts/blender/build_memorial_glb.py -- --output <path.glb>
"""

from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

import bmesh
import bpy


def parse_args() -> argparse.Namespace:
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    return parser.parse_args(argv)


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for datablock in list(datablocks):
            if datablock.users == 0:
                datablocks.remove(datablock)


def material(name: str, color: tuple[float, float, float, float], roughness: float, metallic: float = 0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.use_backface_culling = True
    mat.diffuse_color = color
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = color
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Metallic"].default_value = metallic
    return mat


def recalculate_normals(obj: bpy.types.Object) -> None:
    mesh = obj.data
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()


def prism(
    name: str,
    outline: list[tuple[float, float]],
    depth: float,
    mat: bpy.types.Material,
) -> bpy.types.Object:
    count = len(outline)
    vertices = [(x, -depth / 2, z) for x, z in outline] + [(x, depth / 2, z) for x, z in outline]
    faces: list[tuple[int, ...]] = [
        tuple(reversed(range(count))),
        tuple(range(count, count * 2)),
    ]
    for index in range(count):
        next_index = (index + 1) % count
        faces.append((index, next_index, count + next_index, count + index))

    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.materials.append(mat)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    recalculate_normals(obj)
    return obj


def beveled_cube(
    name: str,
    location: tuple[float, float, float],
    dimensions: tuple[float, float, float],
    mat: bpy.types.Material,
    rotation_y: float = 0.0,
    bevel: float = 0.015,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=(0.0, rotation_y, 0.0))
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    if bevel > 0:
        modifier = obj.modifiers.new(name="Edge_Bevel", type="BEVEL")
        modifier.width = bevel
        modifier.segments = 1
        modifier.limit_method = "ANGLE"
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    return obj


def cylinder(
    name: str,
    location: tuple[float, float, float],
    radius: float,
    depth: float,
    mat: bpy.types.Material,
    rotation: tuple[float, float, float] = (0.0, 0.0, 0.0),
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=8,
        radius=radius,
        depth=depth,
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    return obj


def join_objects(objects: list[bpy.types.Object], name: str) -> bpy.types.Object:
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    joined = bpy.context.object
    joined.name = name
    joined.data.name = f"{name}_Mesh"
    return joined


def build_asset() -> bpy.types.Object:
    concrete = material("MAT_Concrete", (0.23, 0.21, 0.19, 1.0), roughness=0.96)
    oxide = material("MAT_Oxide", (0.66, 0.19, 0.09, 1.0), roughness=0.82, metallic=0.08)
    brass = material("MAT_Brass", (0.72, 0.52, 0.18, 1.0), roughness=0.58, metallic=0.32)

    base = cylinder("Base_Octagonal", (0.0, 0.0, 0.11), 1.05, 0.22, concrete)
    base.scale.y = 0.58
    bpy.context.view_layer.objects.active = base
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    slabs = [
        prism(
            "Fragment_Left",
            [(-0.82, 0.22), (-0.3, 0.22), (-0.31, 1.42), (-0.45, 1.58), (-0.58, 1.49), (-0.74, 1.61)],
            0.42,
            concrete,
        ),
        prism(
            "Fragment_Center",
            [(-0.27, 0.22), (0.25, 0.22), (0.23, 1.7), (0.11, 1.86), (-0.02, 1.71), (-0.14, 1.9), (-0.26, 1.66)],
            0.48,
            concrete,
        ),
        prism(
            "Fragment_Right",
            [(0.29, 0.22), (0.83, 0.22), (0.74, 1.5), (0.58, 1.62), (0.48, 1.44), (0.34, 1.55)],
            0.4,
            concrete,
        ),
    ]
    for index, slab in enumerate(slabs):
        slab.rotation_euler[1] = (index - 1) * -0.055
        modifier = slab.modifiers.new(name="Fractured_Edge_Bevel", type="BEVEL")
        modifier.width = 0.025
        modifier.segments = 1
        modifier.limit_method = "ANGLE"
        bpy.context.view_layer.objects.active = slab
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    lance = beveled_cube(
        "Lance_Diagonal",
        (-0.18, 0.05, 1.25),
        (0.17, 0.2, 2.55),
        concrete,
        rotation_y=-0.24,
        bevel=0.018,
    )
    structure = join_objects([base, *slabs, lance], "Memorial_Structure")

    crack_parts = [
        beveled_cube("Crack_01", (-0.06, -0.255, 0.5), (0.055, 0.035, 0.42), oxide, rotation_y=-0.34, bevel=0.008),
        beveled_cube("Crack_02", (0.02, -0.255, 0.84), (0.05, 0.035, 0.32), oxide, rotation_y=0.24, bevel=0.008),
        beveled_cube("Crack_03", (-0.06, -0.255, 1.12), (0.048, 0.035, 0.3), oxide, rotation_y=-0.3, bevel=0.008),
        beveled_cube("Crack_Branch", (0.12, -0.255, 0.98), (0.04, 0.035, 0.23), oxide, rotation_y=-0.9, bevel=0.008),
        cylinder("Rebar_Left", (-0.58, 0.02, 1.7), 0.018, 0.3, oxide, rotation=(0.0, 0.08, 0.0)),
        cylinder("Rebar_Center", (-0.03, 0.01, 1.94), 0.018, 0.26, oxide, rotation=(0.0, -0.07, 0.0)),
        cylinder("Rebar_Right", (0.61, 0.0, 1.61), 0.018, 0.25, oxide, rotation=(0.0, 0.1, 0.0)),
    ]
    red_triangle = prism(
        "Memory_Red_Triangle",
        [(-0.13, 0.88), (0.14, 0.88), (0.015, 1.12)],
        0.04,
        oxide,
    )
    red_triangle.location.y = -0.285
    crack_parts.append(red_triangle)
    oxide_details = join_objects(crack_parts, "Memorial_Fracture_And_Rebar")

    plaque_parts = [beveled_cube("Plaque", (0.0, -0.285, 0.35), (0.66, 0.035, 0.15), brass, bevel=0.014)]
    worker_specs = [
        (-0.34, 0.74, -0.08),
        (0.0, 0.78, 0.04),
        (0.34, 0.72, 0.1),
    ]
    for index, (x, torso_z, lean) in enumerate(worker_specs, start=1):
        plaque_parts.extend(
            [
                cylinder(
                    f"Worker_{index}_Head",
                    (x + lean * 0.12, -0.305, torso_z + 0.33),
                    0.075,
                    0.035,
                    brass,
                    rotation=(math.pi / 2, 0.0, 0.0),
                ),
                beveled_cube(
                    f"Worker_{index}_Torso",
                    (x, -0.302, torso_z + 0.08),
                    (0.18, 0.045, 0.4),
                    brass,
                    rotation_y=lean,
                    bevel=0.012,
                ),
                beveled_cube(
                    f"Worker_{index}_Arm_Left",
                    (x - 0.105, -0.306, torso_z + 0.1),
                    (0.075, 0.04, 0.32),
                    brass,
                    rotation_y=0.22 + lean,
                    bevel=0.009,
                ),
                beveled_cube(
                    f"Worker_{index}_Arm_Right",
                    (x + 0.105, -0.306, torso_z + 0.1),
                    (0.075, 0.04, 0.32),
                    brass,
                    rotation_y=-0.22 + lean,
                    bevel=0.009,
                ),
            ]
        )
    remembrance = join_objects(plaque_parts, "Memorial_Plaque_Three_Workers")

    root = bpy.data.objects.new("Memorial_9_Novembro", None)
    bpy.context.collection.objects.link(root)
    root["asset_id"] = "memorial-9-novembro-v1"
    root["asset_version"] = 1
    root["units"] = "meters"
    root["style"] = "stylized low-poly interpretation"
    root["collision"] = "navigation bounds remain in runtime; no physics proxy required"

    for obj in (structure, oxide_details, remembrance):
        obj.parent = root

    interaction_anchor = bpy.data.objects.new("ANCHOR_Interaction", None)
    interaction_anchor.location = (0.0, 0.0, 0.0)
    interaction_anchor.parent = root
    bpy.context.collection.objects.link(interaction_anchor)

    beacon_anchor = bpy.data.objects.new("ANCHOR_Beacon", None)
    beacon_anchor.location = (0.0, 0.0, 2.65)
    beacon_anchor.parent = root
    bpy.context.collection.objects.link(beacon_anchor)

    return root


def export_glb(root: bpy.types.Object, output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    for child in root.children_recursive:
        if child.type == "MESH":
            while child.data.uv_layers:
                child.data.uv_layers.remove(child.data.uv_layers[0])
        child.select_set(True)

    bpy.context.view_layer.objects.active = root
    result = bpy.ops.export_scene.gltf(
        filepath=str(output),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_cameras=False,
        export_lights=False,
        export_extras=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
    )
    if result != {"FINISHED"}:
        raise RuntimeError(f"glTF export failed: {result}")


def main() -> None:
    args = parse_args()
    output = Path(args.output).resolve()
    clear_scene()
    bpy.context.scene.unit_settings.system = "METRIC"
    bpy.context.scene.unit_settings.scale_length = 1.0
    bpy.context.scene.render.engine = "BLENDER_EEVEE"
    root = build_asset()
    export_glb(root, output)
    print(f"MEMORIAL_GLB_EXPORTED={output}")


if __name__ == "__main__":
    main()
