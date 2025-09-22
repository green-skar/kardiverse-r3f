#!/usr/bin/env python3
"""
Blender Export Script for Kardiverse Avatar
Exports 3D models optimized for web and video generation
"""

import bpy
import bmesh
import os
import json
from mathutils import Vector

class KardiverseBlenderExporter:
    def __init__(self):
        self.output_dir = "C:/Users/kahush/Desktop/hg avatar/kardiverse-r3f/public/assets"
        self.avatar_name = "kardiverse_avatar"
        
    def setup_scene(self):
        """Setup the Blender scene for Kardiverse avatar"""
        # Clear existing mesh objects
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete(use_global=False)
        
        # Set render settings for web optimization
        bpy.context.scene.render.engine = 'BLENDER_EEVEE'
        bpy.context.scene.render.resolution_x = 1920
        bpy.context.scene.render.resolution_y = 1080
        bpy.context.scene.render.resolution_percentage = 100
        bpy.context.scene.render.fps = 30
        
        # Set frame range for 30-second video
        bpy.context.scene.frame_start = 1
        bpy.context.scene.frame_end = 900  # 30 seconds at 30fps
        
        # Enable transparency
        bpy.context.scene.render.film_transparent = True
        
    def create_avatar_base(self):
        """Create the base avatar geometry"""
        # Create a humanoid base mesh
        bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 1))
        base_cube = bpy.context.active_object
        base_cube.name = "avatar_base"
        
        # Add subdivision surface for smoother geometry
        bpy.ops.object.modifier_add(type='SUBSURF')
        base_cube.modifiers["Subdivision Surface"].levels = 2
        
        # Add armature for animation
        bpy.ops.object.armature_add(location=(0, 0, 0))
        armature = bpy.context.active_object
        armature.name = "avatar_armature"
        
        # Enter edit mode to create bones
        bpy.context.view_layer.objects.active = armature
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Create basic bone structure
        bones = armature.data.edit_bones
        
        # Root bone
        root = bones.new("root")
        root.head = (0, 0, 0)
        root.tail = (0, 0, 0.5)
        
        # Spine
        spine = bones.new("spine")
        spine.head = (0, 0, 0.5)
        spine.tail = (0, 0, 1.5)
        spine.parent = root
        
        # Head
        head = bones.new("head")
        head.head = (0, 0, 1.5)
        head.tail = (0, 0, 2.2)
        head.parent = spine
        
        # Left arm
        left_arm = bones.new("left_arm")
        left_arm.head = (0, 0, 1.3)
        left_arm.tail = (-0.8, 0, 1.3)
        left_arm.parent = spine
        
        # Right arm
        right_arm = bones.new("right_arm")
        right_arm.head = (0, 0, 1.3)
        right_arm.tail = (0.8, 0, 1.3)
        right_arm.parent = spine
        
        # Exit edit mode
        bpy.ops.object.mode_set(mode='OBJECT')
        
        return base_cube, armature
        
    def create_holographic_material(self):
        """Create holographic material with glow effects"""
        # Create new material
        material = bpy.data.materials.new(name="holographic_material")
        material.use_nodes = True
        nodes = material.node_tree.nodes
        links = material.node_tree.links
        
        # Clear default nodes
        nodes.clear()
        
        # Add Principled BSDF
        bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
        bsdf.location = (0, 0)
        
        # Add Emission for glow
        emission = nodes.new(type='ShaderNodeEmission')
        emission.location = (-200, 0)
        
        # Add Fresnel for edge glow
        fresnel = nodes.new(type='ShaderNodeFresnel')
        fresnel.location = (-400, 0)
        
        # Add ColorRamp for fresnel control
        color_ramp = nodes.new(type='ShaderNodeValToRGB')
        color_ramp.location = (-300, 0)
        
        # Add Material Output
        output = nodes.new(type='ShaderNodeOutputMaterial')
        output.location = (200, 0)
        
        # Connect nodes
        links.new(fresnel.outputs['Fac'], color_ramp.inputs['Fac'])
        links.new(color_ramp.outputs['Color'], emission.inputs['Color'])
        links.new(emission.outputs['Emission'], output.inputs['Emission'])
        links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
        
        # Set colors for holographic effect
        color_ramp.color_ramp.elements[0].color = (0.2, 0.9, 1.0, 1.0)  # Cyan
        color_ramp.color_ramp.elements[1].color = (0.0, 0.0, 0.0, 1.0)  # Black
        
        # Set material properties
        bsdf.inputs['Base Color'].default_value = (0.2, 0.9, 1.0, 1.0)
        bsdf.inputs['Metallic'].default_value = 0.0
        bsdf.inputs['Roughness'].default_value = 0.1
        bsdf.inputs['Transmission'].default_value = 0.8
        bsdf.inputs['Alpha'].default_value = 0.7
        
        return material
        
    def create_animation(self, avatar_obj, armature_obj):
        """Create 30-second animation sequence"""
        # Select avatar object
        bpy.context.view_layer.objects.active = avatar_obj
        
        # Add keyframes for breathing animation
        for frame in range(1, 901, 30):  # Every second
            bpy.context.scene.frame_set(frame)
            
            # Breathing scale
            scale_factor = 1.0 + 0.05 * (1 if (frame // 30) % 2 == 0 else -1)
            avatar_obj.scale = (1.0, 1.0, scale_factor)
            avatar_obj.keyframe_insert(data_path="scale", frame=frame)
            
            # Gentle rotation
            rotation_z = (frame / 900.0) * 360  # Full rotation over 30 seconds
            avatar_obj.rotation_euler = (0, 0, rotation_z)
            avatar_obj.keyframe_insert(data_path="rotation_euler", frame=frame)
            
        # Add armature animation
        bpy.context.view_layer.objects.active = armature_obj
        bpy.ops.object.mode_set(mode='POSE')
        
        for frame in range(1, 901, 60):  # Every 2 seconds
            bpy.context.scene.frame_set(frame)
            
            # Animate arms
            left_arm = armature_obj.pose.bones.get("left_arm")
            right_arm = armature_obj.pose.bones.get("right_arm")
            
            if left_arm and right_arm:
                # Gentle arm movement
                arm_rotation = 10 * (1 if (frame // 60) % 2 == 0 else -1)
                left_arm.rotation_euler = (0, 0, arm_rotation)
                right_arm.rotation_euler = (0, 0, -arm_rotation)
                
                left_arm.keyframe_insert(data_path="rotation_euler", frame=frame)
                right_arm.keyframe_insert(data_path="rotation_euler", frame=frame)
        
        bpy.ops.object.mode_set(mode='OBJECT')
        
    def export_glb(self, filename="avatar.glb"):
        """Export to GLB format for web use"""
        # Select all objects
        bpy.ops.object.select_all(action='SELECT')
        
        # Export to GLB
        export_path = os.path.join(self.output_dir, filename)
        bpy.ops.export_scene.gltf(
            filepath=export_path,
            export_format='GLB',
            use_selection=True,
            export_animations=True,
            export_materials='EXPORT',
            export_colors=True,
            export_cameras=False,
            export_lights=False,
            export_extras=True,
            export_yup=True,
            export_apply=True,
            export_anim_single_armature=True,
            export_frame_range=True,
            export_frame_step=1,
            export_force_sampling=True,
            export_nla_strips=True,
            export_def_bones=True,
            export_current_frame=False,
            export_skins=True,
            export_all_influences=False,
            export_morph=True,
            export_morph_normal=True,
            export_morph_tangent=False,
            export_lights=False,
            export_cameras=False,
            export_extras=True,
            export_yup=True,
            export_apply=True,
            export_anim_single_armature=True,
            export_frame_range=True,
            export_frame_step=1,
            export_force_sampling=True,
            export_nla_strips=True,
            export_def_bones=True,
            export_current_frame=False,
            export_skins=True,
            export_all_influences=False,
            export_morph=True,
            export_morph_normal=True,
            export_morph_tangent=False
        )
        
        print(f"Exported GLB to: {export_path}")
        
    def export_frames(self, output_dir="frames"):
        """Export individual frames for video generation"""
        frames_dir = os.path.join(self.output_dir, output_dir)
        os.makedirs(frames_dir, exist_ok=True)
        
        # Set output format
        bpy.context.scene.render.image_settings.file_format = 'PNG'
        bpy.context.scene.render.filepath = os.path.join(frames_dir, "frame_")
        
        # Render frames
        bpy.ops.render.render(animation=True)
        
        print(f"Exported frames to: {frames_dir}")
        
    def create_metadata(self):
        """Create metadata file for the exported assets"""
        metadata = {
            "avatar": {
                "name": "Kardiverse Avatar",
                "version": "1.0",
                "duration": 30,
                "fps": 30,
                "resolution": {
                    "width": 1920,
                    "height": 1080
                },
                "format": "GLB",
                "features": [
                    "holographic_material",
                    "breathing_animation",
                    "rotation_animation",
                    "arm_movement",
                    "glow_effects"
                ],
                "optimization": {
                    "polygon_count": "low",
                    "texture_size": "1024x1024",
                    "compression": "enabled"
                }
            },
            "export_settings": {
                "blender_version": bpy.app.version_string,
                "export_date": bpy.context.scene.frame_current,
                "output_directory": self.output_dir
            }
        }
        
        metadata_path = os.path.join(self.output_dir, "avatar_metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
            
        print(f"Created metadata: {metadata_path}")
        
    def run_export(self):
        """Run the complete export process"""
        print("Starting Kardiverse Avatar Export...")
        
        # Setup scene
        self.setup_scene()
        print("Scene setup complete")
        
        # Create avatar
        avatar_obj, armature_obj = self.create_avatar_base()
        print("Avatar base created")
        
        # Create material
        material = self.create_holographic_material()
        avatar_obj.data.materials.append(material)
        print("Holographic material created")
        
        # Create animation
        self.create_animation(avatar_obj, armature_obj)
        print("Animation created")
        
        # Export GLB
        self.export_glb()
        print("GLB export complete")
        
        # Export frames
        self.export_frames()
        print("Frame export complete")
        
        # Create metadata
        self.create_metadata()
        print("Metadata created")
        
        print("Export process complete!")

# Run the exporter
if __name__ == "__main__":
    exporter = KardiverseBlenderExporter()
    exporter.run_export()

